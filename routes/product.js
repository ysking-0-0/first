const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')

// @route   GET api/products/recommend
// @desc    Get recommend products
// @access  Public
router.get('/recommend', productController.getRecommendProducts)

// @route   GET api/products/detail
// @desc    Get product detail
// @access  Public
router.get('/detail', productController.getProductDetail)

// @route   GET api/products/category
// @desc    Get products by category
// @access  Public
router.get('/category', productController.getProductsByCategory)

router.get('/', productController.getProducts)

router.get('/search', productController.searchProducts)

module.exports = router