// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 微信相关字段
  openId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickName: {
    type: String,
    default: '微信用户'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  
  // 用户信息
  phone: {
    type: String,
    default: ''
  },
  
  // 收货地址
  address: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^1[3-9]\d{9}$/, '请输入有效的手机号'] // 简单的手机号正则
    },
    region: {
      type: [String], // 例如: ["广东省", "广州市", "天河区"]
      required: true
    },
    detail: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 修复：检查是否已存在模型，避免重复编译
module.exports = mongoose.models.User || mongoose.model('User', userSchema);