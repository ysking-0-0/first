// middlewares/errorMiddleware.js
const config = require('../config/config');

// 异步错误处理
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404处理
const notFound = (req, res, next) => {
  const error = new Error(`接口不存在 - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 全局错误处理
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose错误处理
  if (err.name === 'CastError') {
    const message = '资源不存在';
    error = { message, statusCode: 404 };
  }

  // Mongoose重复键错误
  if (err.code === 11000) {
    const message = '数据已存在';
    error = { message, statusCode: 400 };
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || res.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: error.message || '服务器错误',
    ...(config.app.isDevelopment && { stack: err.stack })
  });
};

module.exports = {
  asyncHandler,
  notFound,
  errorHandler
};