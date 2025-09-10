// controllers/categoryController.js
const Category = require('../models/Category')

// 创建分类
exports.createCategory = async (req, res) => {
  try {
    const { shopId, name, icon, description, sortOrder } = req.body
    
    const category = await Category.create({
      shopId,
      name,
      icon: icon || '',
      description: description || '',
      sortOrder: sortOrder || 0
    })

    res.status(201).json({
      success: true,
      data: category
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 获取店铺分类列表
exports.getShopCategories = async (req, res) => {
  try {
    const { shopId } = req.params
    const categories = await Category.getShopCategories(shopId)

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 获取单个分类详情
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }

    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 更新分类信息
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, description, sortOrder } = req.body
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, description, sortOrder },
      { new: true, runValidators: true }
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }

    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 删除分类（软删除）
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }

    await category.deactivate()

    res.json({
      success: true,
      message: '分类已删除'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 更新分类状态
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { isActive } = req.body
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }

    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}