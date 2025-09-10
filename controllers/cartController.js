// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 添加到购物车
exports.addToCart = async (req, res) => {
  try {
    const { productId, specs, quantity } = req.body;
    const userId = req.user.id;
    
    // 检查商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // 关键修复：只按 userId 和 productId 查询（与唯一索引一致）
    let cart = await Cart.findOne({ userId, productId });
    
    if (cart) {
      // 如果已有，增加数量（如果需要区分规格，这里需要额外处理）
      cart.quantity += quantity;
      // 如果规格有变化，更新规格（可选，根据业务需求）
      if (specs) cart.specs = specs;
    } else {
      // 如果没有，创建新记录
      cart = new Cart({
        userId,
        productId,
        specs,
        quantity,
        price: product.price,
        productName: product.name,
        productImage: product.coverImage
      });
    }
    
    await cart.save();
    
    // 填充商品信息返回
    const populatedCart = await Cart.findById(cart._id)
      .populate('productId', 'name price coverImage stock');
    
    res.json({
      success: true,
      message: '已加入购物车',
      cartItem: populatedCart
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 获取购物车列表
exports.getCartList = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ userId })
      .populate('productId', 'name price coverImage stock');
    
    res.json({
      success: true,
      cartItems
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 更新购物车商品数量
exports.updateCartItem = async (req, res) => {
  try {
    const { cartId, quantity } = req.body;
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ _id: cartId, userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // 检查库存
    const product = await Product.findById(cart.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ error: '库存不足' });
    }
    
    cart.quantity = quantity;
    await cart.save();
    
    // 填充后返回
    const populatedCart = await Cart.findById(cart._id)
      .populate('productId', 'name price coverImage stock');
    
    res.json({
      success: true,
      message: '更新成功',
      cartItem: populatedCart
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 删除购物车商品
exports.removeCartItem = async (req, res) => {
  try {
    const { cartId } = req.body;
    const userId = req.user.id;
    
    const cart = await Cart.findOneAndDelete({ _id: cartId, userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};




// 支付时，删除购物车中对应的数据
exports.removeMultiple = async (req, res) => {
  try {
    const { cartIds } = req.body;
    const userId = req.user.id;
    
    console.log('要删除的购物车ID:', cartIds);
    console.log('用户ID:', userId);

    // 验证输入
    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的购物车ID数组'
      });
    }

    const result = await Cart.deleteMany({ 
      _id: { $in: cartIds },
      userId: userId 
    });

    console.log('删除结果:', result);

    res.json({
      success: true,
      message: `成功删除 ${result.deletedCount} 个购物车项`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('删除购物车错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};