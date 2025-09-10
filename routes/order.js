// routes/order.js
const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const orderController = require('../controllers/orderController')

// @route   POST api/orders
// @desc    创建订单
// @access  Private
router.post('/', authenticate, orderController.createOrder)

// @route   GET api/orders/user
// @desc    获取用户订单列表
// @access  Private
router.get('/user', authenticate, orderController.getUserOrders)

// @route   GET api/orders/shop
// @desc    获取店铺订单列表
// @access  Private
router.get('/shop', authenticate, orderController.getShopOrders)

// @route   GET api/orders/:id
// @desc    获取订单详情
// @access  Private
router.get('/:id', authenticate, orderController.getOrderById)

// @route   PUT api/orders/:id/status
// @desc    更新订单状态
// @access  Private
router.put('/:id/status', authenticate, orderController.updateOrderStatus)

// @route   PUT api/orders/:id/payment
// @desc    更新支付状态
// @access  Private
router.put('/:id/payment', authenticate, orderController.updatePaymentStatus)

// @route   DELETE api/orders/:id
// @desc    取消订单
// @access  Private
router.delete('/:id', authenticate, orderController.cancelOrder)

module.exports = router