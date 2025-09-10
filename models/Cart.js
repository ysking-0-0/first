// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  specs: {
    type: Object,
    default: {}
  },
  price: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动设置updatedAt
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 复合索引，确保同一用户同一商品只有一条记录
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// 静态方法：获取用户购物车
cartSchema.statics.getUserCart = function(userId) {
  return this.find({ userId })
    .populate('productId', 'name price coverImage stock')
    .sort({ updatedAt: -1 });
};




module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);