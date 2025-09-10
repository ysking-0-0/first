// middlewares/validationMiddleware.js
const { body, validationResult } = require('express-validator');

// 处理验证错误
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// 商品验证规则
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('商品名称不能为空')
    .isLength({ max: 100 })
    .withMessage('商品名称不能超过100字符'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('价格必须大于0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('库存必须大于等于0'),
  handleValidationErrors
];

// 用户地址验证规则
const validateAddress = [
  body('name')
    .notEmpty()
    .withMessage('收货人姓名不能为空'),
  body('phone')
    .isMobilePhone('zh-CN')
    .withMessage('请输入有效的手机号码'),
  body('region')
    .isArray({ min: 3 })
    .withMessage('请选择完整的省市区'),
  body('detail')
    .notEmpty()
    .withMessage('详细地址不能为空'),
  handleValidationErrors
];

module.exports = {
  validateProduct,
  validateAddress,
  handleValidationErrors
};