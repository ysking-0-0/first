// routes/banner.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const bannerController = require('../controllers/bannerController');


// 获取轮播图列表
router.get('/', bannerController.getBanners);

// 获取轮播图详情
router.get('/:id', bannerController.getBannerDetail);

// 创建轮播图（需要认证）
router.post('/', authenticate, bannerController.createBanner);

// 更新轮播图（需要认证）
router.put('/:id', authenticate, bannerController.updateBanner);

// 删除轮播图（需要认证）
router.delete('/:id', authenticate, bannerController.deleteBanner);

// 获取店铺所有轮播图（需要认证）
router.get('/shop/all', authenticate, bannerController.getAllBannersByShop);

router.get('/test-db', bannerController.testDB);

module.exports = router;