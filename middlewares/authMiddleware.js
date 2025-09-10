const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/config');

// 验证JWT token
const authenticate = async (req, res, next) => {
  try {
    console.log('认证中间件被调用');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('没有找到token');
      return res.status(401).json({ error: '访问被拒绝，需要token' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Token解码成功，用户ID:', decoded.userId);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {  // ← 修复：删除多余的 "v"
      console.log('用户不存在:', decoded.userId);
      return res.status(401).json({ error: '用户不存在' });
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    req.token = token;
    console.log('认证成功，用户:', user._id);
    next();
  } catch (error) {
    console.error('认证错误:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token已过期' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的token' });
    }
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = { authenticate };