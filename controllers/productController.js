const Product = require('../models/Product')
const Category = require('../models/Category')
// 1. 确保配置文件已导入（你的原始代码已导入，无需新增）
const config = require('../config/config');

// 获取推荐商品 - 核心修改：添加默认店铺ID查询条件
exports.getRecommendProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      shopId: config.business.shop.defaultShopId, // 2. 新增默认店铺ID条件
      isRecommend: true,
      isOnSale: true 
    }).limit(10);
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '获取推荐商品失败'
    });
  }
};

// 获取商品详情 - 无需修改（通过ID查询，与店铺无关）
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.query

    const product = await Product.findById(id)
    
    if (!product) {
      console.log("数据库中未找到该商品，id：", id);
      return res.status(404).json({ msg: 'Product not found' })
    }
    
    res.json({ success: true, product });

  } catch (err) {

    console.error("详情接口错误：", err.message)

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' })
    }
    
    res.status(500).send('Server Error')
  }
}

// 获取分类商品 - 核心修改：添加默认店铺ID查询条件
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.query
    const products = await Product.find({ 
      shopId: config.business.shop.defaultShopId, // 3. 新增默认店铺ID条件
      categoryId,
      isOnSale: true 
    })
    
    res.json(products)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

// 获取商品列表（分页）- 核心修改：添加默认店铺ID查询条件
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, recommend } = req.query;
    
    // 4. 构建查询条件时，强制添加默认店铺ID
    const query = { 
      shopId: config.business.shop.defaultShopId,
      isOnSale: true 
    };
    
    if (category) {
      query.categoryId = category;
    }
    
    if (recommend === 'true') {
      query.isRecommend = true;
    }

    // 分页查询（保持原始逻辑不变）
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    // 获取总数（基于包含默认店铺ID的查询条件）
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      error: '获取商品列表失败' 
    });
  }
};

// 新增：模糊搜索商品（根据名称）
exports.searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        error: '请输入搜索关键词' 
      });
    }

    // MongoDB 正则匹配：模糊匹配商品名称（不区分大小写）
    const products = await Product.find({
      shopId: config.business.shop.defaultShopId, // 固定店铺ID
      isOnSale: true, // 只搜索上架商品
      name: { $regex: keyword, $options: 'i' } // $regex 模糊匹配，$options: 'i' 不区分大小写
    }).limit(20); // 限制最多返回20条结果

    res.json({
      success: true,
      products // 返回搜索到的商品列表
    });
  } catch (err) {
    console.error('搜索商品失败:', err.message);
    res.status(500).json({
      success: false,
      error: '搜索商品失败'
    });
  }
};