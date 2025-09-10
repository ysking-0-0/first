// controllers/orderController.js
const Order = require('../models/Order')

// 创建订单
exports.createOrder = async (req, res) => {
  try {
    const { shopId, items, shippingAddress, paymentMethod, contactPhone } = req.body
    const userId = req.user.id // 从认证中间件获取用户ID

    // 计算订单金额
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = 0 // 这里可以根据业务逻辑计算配送费
    const discount = 0 // 这里可以根据业务逻辑计算折扣
    const finalAmount = totalAmount + deliveryFee - discount

    const order = await Order.create({
      userId,
      shopId,
      items,
      totalAmount,
      deliveryFee,
      discount,
      finalAmount,
      shippingAddress,
      paymentMethod,
      contactPhone
    })

    res.status(201).json({
      success: true,
      data: order
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 获取用户订单列表
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query

    const orders = await Order.getUserOrders(userId, parseInt(page), parseInt(limit))

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 获取店铺订单列表
exports.getShopOrders = async (req, res) => {
  try {
    // 假设用户有店铺信息，这里需要根据业务逻辑调整
    const shopId = req.user.shopId // 需要确保用户模型中有shopId字段
    const { page = 1, limit = 10, status } = req.query

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '用户未关联店铺'
      })
    }

    const orders = await Order.getShopOrders(shopId, status, parseInt(page), parseInt(limit))

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 获取订单详情
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'nickName avatarUrl')
      .populate('shopId', 'name logo')
      .populate('items.productId', 'name coverImage')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }

    // 检查权限：用户只能查看自己的订单，商家只能查看自己店铺的订单
    const userId = req.user.id
    const isOwner = order.userId._id.toString() === userId
    const isShopOwner = req.user.shopId && order.shopId._id.toString() === req.user.shopId

    if (!isOwner && !isShopOwner) {
      return res.status(403).json({
        success: false,
        message: '无权查看此订单'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }

    // 检查权限：只有商家可以更新订单状态
    const isShopOwner = req.user.shopId && order.shopId.toString() === req.user.shopId
    if (!isShopOwner) {
      return res.status(403).json({
        success: false,
        message: '无权更新此订单状态'
      })
    }

    const updatedOrder = await order.updateStatus(status)

    res.json({
      success: true,
      data: updatedOrder
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 更新支付状态
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }

    // 检查权限：用户只能更新自己的订单支付状态
    const isOwner = order.userId.toString() === req.user.id
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: '无权更新此订单支付状态'
      })
    }

    order.paymentStatus = paymentStatus
    if (paymentStatus === 'paid') {
      order.paidAt = new Date()
      // 支付成功后自动更新订单状态为已支付
      if (order.status === 'pending') {
        order.status = 'paid'
      }
    }

    const updatedOrder = await order.save()

    res.json({
      success: true,
      data: updatedOrder
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 取消订单
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }

    // 检查权限：用户只能取消自己的订单
    const isOwner = order.userId.toString() === req.user.id
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: '无权取消此订单'
      })
    }

    // 只有待支付或已支付的订单可以取消
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '当前订单状态不可取消'
      })
    }

    const updatedOrder = await order.updateStatus('cancelled')

    res.json({
      success: true,
      data: updatedOrder,
      message: '订单已取消'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}