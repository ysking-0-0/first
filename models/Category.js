// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // 关联字段
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  // 分类信息
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  icon: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  
  // 排序和状态
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 时间戳
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
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 索引优化
categorySchema.index({ shopId: 1, isActive: 1 });
categorySchema.index({ shopId: 1, sortOrder: 1 });

// 静态方法：获取店铺的分类
categorySchema.statics.getShopCategories = function(shopId) {
  return this.find({ 
    shopId, 
    isActive: true 
  }).sort({ sortOrder: 1, createdAt: 1 });
};

// 实例方法：停用分类
categorySchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema);