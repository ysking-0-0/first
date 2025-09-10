const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId, // 保持ObjectId
    required: true,
    ref: 'Shop'
    // type: String,  
    // required: true,
    // default: 'default-shop'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category'
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  originalPrice: Number,
  coverImage: String,
  images: [String],
  stock: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  specs: [{
    name: String,
    values: [String]
  }],
  isRecommend: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Product', ProductSchema)