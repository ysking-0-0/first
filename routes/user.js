const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// 获取用户信息
router.get('/profile', authenticate, userController.getProfile);

// 更新用户信息
router.put('/profile', authenticate, userController.updateProfile);

// 获取用户地址列表
router.get('/address', authenticate, userController.getAddressList);

// 添加收货地址
router.post('/address', authenticate, userController.addAddress);

// 更新收货地址
router.put('/address/:addressId', authenticate, userController.updateAddress);

// 删除收货地址  
router.delete('/address/:addressId', authenticate, userController.deleteAddress);

// 设置默认地址
router.patch('/address/:addressId/default', authenticate, userController.setDefaultAddress);

module.exports = router;