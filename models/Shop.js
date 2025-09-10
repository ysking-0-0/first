// models/Shop.js
const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  // 店铺基本信息
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  
  // 联系方式
  contact: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  
  // 营业信息
  businessHours: {
    open: {
      type: String,
      default: '08:00'
    },
    close: {
      type: String,
      default: '22:00'
    }
  },
  
  // 店铺状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // 配送设置
  deliverySettings: {
    minFreeOrder: {
      type: Number,
      default: 0 // 免配送费最低订单金额
    },
    deliveryFee: {
      type: Number,
      default: 0 // 配送费用
    },
    deliveryRadius: {
      type: Number,
      default: 5 // 配送半径（公里）
    }
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
shopSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 静态方法：获取活跃店铺
shopSchema.statics.getActiveShops = function() {
  return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

// 虚拟字段：是否营业中
shopSchema.virtual('isOpen').get(function() {
  const now = new Date();
  const currentTime = now.getHours() + ':' + now.getMinutes();
  return currentTime >= this.businessHours.open && currentTime <= this.businessHours.close;
});

module.exports = mongoose.model('Shop', shopSchema);