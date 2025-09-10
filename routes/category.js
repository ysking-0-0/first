// routes/category.js
const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const categoryController = require('../controllers/categoryController')

// @route   POST api/categories
// @desc    创建分类
// @access  Private (商家权限)
router.post('/', authenticate, categoryController.createCategory)

// @route   GET api/categories/shop/:shopId
// @desc    获取店铺分类列表
// @access  Public
router.get('/shop/:shopId', categoryController.getShopCategories)

// @route   GET api/categories/:id
// @desc    获取单个分类详情
// @access  Public
router.get('/:id', categoryController.getCategoryById)

// @route   PUT api/categories/:id
// @desc    更新分类信息
// @access  Private (商家权限)
router.put('/:id', authenticate, categoryController.updateCategory)

// @route   DELETE api/categories/:id
// @desc    删除分类（软删除）
// @access  Private (商家权限)
router.delete('/:id', authenticate, categoryController.deleteCategory)

// @route   PATCH api/categories/:id/status
// @desc    更新分类状态
// @access  Private (商家权限)
router.patch('/:id/status', authenticate, categoryController.updateCategoryStatus)

module.exports = router