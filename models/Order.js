// models/Order.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  // 订单基本信息
  orderNo: {
    type: String,
    required: true,
    unique: true,
    default: () => {
      const date = new Date();
      const datePart = date.toISOString().replace(/-|T|:|\..*/g, '').slice(2, 10);
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      return `${datePart}${randomPart}`;
    }
  },
  
  // 关联字段
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  // 订单商品
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    specs: {
      type: Object,
      default: {}
    },
    image: {
      type: String,
      default: ''
    }
  }],
  
  // 金额信息
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 订单状态
  status: {
    type: String,
    enum: ['pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // 支付信息
  paymentMethod: {
    type: String,
    enum: ['wechat', 'alipay', 'cash', 'bank'],
    default: 'wechat'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // 配送信息
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    region: {
      type: [String],
      required: true
    },
    detail: {
      type: String,
      required: true
    }
  },
  contactPhone: {
    type: String,
    required: true
  },
  
  // 核销信息
  qrCode: {
    type: String,
    default: ''
  },
  verificationToken: {
    type: String,
    default: () => uuidv4()
  },
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
});

// 更新时自动设置updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // 自动计算最终金额
  if (this.isModified('totalAmount') || this.isModified('deliveryFee') || this.isModified('discount')) {
    this.finalAmount = this.totalAmount + this.deliveryFee - this.discount;
  }
  
  next();
});



// 静态方法：获取用户订单
orderSchema.statics.getUserOrders = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('shopId', 'name logo');
};

// 静态方法：获取店铺订单
orderSchema.statics.getShopOrders = function(shopId, status, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const query = { shopId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'nickName avatarUrl');
};

// 实例方法：更新订单状态
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // 记录状态变更时间
  if (newStatus === 'paid') {
    this.paidAt = new Date();
  } else if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

// 虚拟字段：订单商品总数
orderSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);