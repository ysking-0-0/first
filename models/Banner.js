// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  // 关联字段
  shopId: {
    type: String,
    default: '68bbb50f88f8810ffe028be6',
    required: true
    // type: mongoose.Schema.Types.ObjectId,
    // required: true,
    // ref: 'Shop'  
  },
  
  // 轮播图内容
  imageUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  
  // 链接设置
  linkType: {
    type: String,
    enum: ['product', 'category', 'url', 'none'],
    default: 'none'
  },
  linkTarget: {
    type: String,
    default: ''
  },
  
  // 显示设置
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
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
});

// 更新时自动设置updatedAt
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 索引优化
bannerSchema.index({ shopId: 1, isActive: 1 });
bannerSchema.index({ shopId: 1, sortOrder: 1 });

bannerSchema.statics.getActiveBanners = function(shopId) {
  return this.find({
    shopId: shopId,
    isActive: true
    // 移除时间过滤条件，或者调整逻辑
  }).sort({ sortOrder: 1, createdAt: -1 });
};

// 静态方法：获取有效轮播图 可用
// bannerSchema.statics.getActiveBanners = async function(shopId) {
//   console.log('执行查询，shopId:', shopId);
  
//   try {
//     const query = {
//       shopId: shopId,
//       isActive: true
//     };
    
//     console.log('查询条件:', JSON.stringify(query));
    
//     // 检查集合是否存在
//     const collectionExists = await this.db.db.listCollections({ name: 'banners' }).hasNext();
//     console.log('banners集合是否存在:', collectionExists);
    
//     // 执行查询
//     const result = await this.find(query).sort({ sortOrder: 1, createdAt: -1 });
//     console.log('查询结果:', result);
    
//     return result;
//   } catch (error) {
//     console.error('查询执行错误:', error);
//     throw error;
//   }
// };



// 静态方法：获取店铺所有轮播图（包括未激活的）
bannerSchema.statics.getBannersByShop = function(shopId) {
  return this.find({ shopId: shopId }).sort({ sortOrder: 1, createdAt: -1 });
};

// 虚拟字段：是否在有效期内
bannerSchema.virtual('isValid').get(function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
});

module.exports = mongoose.model('Banner', bannerSchema);