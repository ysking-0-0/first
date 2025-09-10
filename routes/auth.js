// routes/auth.js
//  认证路由 (routes/auth.js) - 负责登录注册
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware'); 

const authController = require('../controllers/authController');


// 微信登录接口
router.post('/wechat-login', authController.wechatLogin.bind(authController));
// router.post('/wechat-login', (req, res) => {
//   res.json({ success: true, message: 'wechat-login 路由生效了！' });
// });

// @route   POST /api/auth/register
// @desc    用户注册
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    用户登录
// @access  Public  
router.post('/login', authController.login);

// @route   POST /api/auth/logout
// @desc    用户登出
// @access  Private
router.post('/logout', authenticate, authController.logout);   

// @route   GET /api/auth/me
// @desc    获取当前用户信息（通过token）
// @access  Private
router.get('/me', authenticate, authController.getCurrentUser);

      // 这里应该有 authenticate
      // 这里应该有 authenticate

module.exports = router;