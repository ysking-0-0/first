// controllers/bannerController.js
const Banner = require('../models/Banner');
// 1. 导入配置文件，获取默认店铺ID
const config = require('../config/config');


// 测试数据库连接
exports.testDB = async (req, res) => {
  try {
    const count = await Banner.countDocuments();
    console.log('数据库中的轮播图数量:', count);
    res.json({ count });
  } catch (error) {
    console.error('数据库连接错误:', error);
    res.status(500).json({ error: '数据库连接失败' });
  }
};

// 获取轮播图列表（激活状态）- 核心修改：使用默认店铺ID，移除shopId参数校验
exports.getBanners = async (req, res) => {
  try {
    // 2. 直接从配置中获取默认店铺ID，无需前端传参
    const defaultShopId = config.business.shop.defaultShopId;
    
    const banners = await Banner.getActiveBanners(defaultShopId);


    res.json({ 
      
      success: true, 
      data: banners
    });
  } catch (error) {
    console.error('获取轮播图错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取轮播图失败' 
    });
  }
};

// 获取轮播图详情 - 无需修改（通过ID查询，与店铺无关）
exports.getBannerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        error: '轮播图不存在' 
      });
    }

    res.json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    console.error('获取轮播图详情错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取轮播图详情失败' 
    });
  }
};

// 创建轮播图 - 核心修改：自动注入默认店铺ID
exports.createBanner = async (req, res) => {
  try {
    // 3. 创建轮播图时，强制添加默认店铺ID（避免手动传参）
    const bannerData = {
      ...req.body,
      shopId: config.business.shop.defaultShopId // 自动注入默认店铺ID
    };
    const banner = new Banner(bannerData);
    await banner.save();

    res.status(201).json({ 
      success: true, 
      message: '轮播图创建成功',
      banner 
    });
  } catch (error) {
    console.error('创建轮播图错误:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: '数据验证失败',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: '创建轮播图失败' 
    });
  }
};

// 更新轮播图 - 无需修改（通过ID更新，与店铺无关）
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        error: '轮播图不存在' 
      });
    }

    res.json({ 
      success: true, 
      message: '轮播图更新成功',
      banner 
    });
  } catch (error) {
    console.error('更新轮播图错误:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: '数据验证失败',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: '更新轮播图失败' 
    });
  }
};

// 删除轮播图 - 无需修改（通过ID删除，与店铺无关）
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        error: '轮播图不存在' 
      });
    }

    res.json({ 
      success: true, 
      message: '轮播图删除成功' 
    });
  } catch (error) {
    console.error('删除轮播图错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '删除轮播图失败' 
    });
  }
};

// 获取店铺所有轮播图（包括未激活）- 核心修改：使用默认店铺ID，移除shopId参数校验
exports.getAllBannersByShop = async (req, res) => {
  try {
    // 4. 直接从配置中获取默认店铺ID，无需前端传参
    const defaultShopId = config.business.shop.defaultShopId;
    const banners = await Banner.getBannersByShop(defaultShopId);
    
    res.json({ 
      success: true, 
      banners 
    });
  } catch (error) {
    console.error('获取店铺轮播图错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取店铺轮播图失败' 
    });
  }
};