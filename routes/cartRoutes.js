const express = require('express')
const router = express.Router()
// const auth = require('../middlewares/authMiddleware')
const { authenticate } = require('../middlewares/authMiddleware') // 解构导入
const cartController = require('../controllers/cartController')


// @route   POST api/cart/add
// @desc    Add to cart
// @access  Private
router.post('/add', authenticate, cartController.addToCart)

// @route   GET api/cart/list
// @desc    Get cart list
// @access  Private
router.get('/list', authenticate, cartController.getCartList)  

// @route   PUT api/cart/update
// @desc    Update cart item
// @access  Private
router.put('/update', authenticate, cartController.updateCartItem)

// @route   DELETE api/cart/remove
// @desc    Remove cart item
// @access  Private
router.delete('/remove', authenticate, cartController.removeCartItem)


router.delete('/remove-multiple', authenticate, cartController.removeMultiple )

// router.delete('/remove-multiple', cartController.removeMultiple); 


module.exports = router