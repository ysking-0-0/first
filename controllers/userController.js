
// 用户信息路由 (routes/user.js) - 负责用户资料管理
const User = require('../models/user');

// 获取用户个人信息
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-openId -__v');
    
    res.json({
      success: true,
      userInfo: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        address: user.address || []
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const { nickName, avatarUrl, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nickName, avatarUrl, phone, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-openId -__v');

    res.json({
      success: true,
      message: '用户信息更新成功',
      userInfo: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ success: false, error: '更新用户信息失败' });
  }
};

// 获取用户地址列表
exports.getAddressList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('address');
    res.json({ success: true, address: user.address || [] });
  } catch (error) {
    console.error('获取地址列表错误:', error);
    res.status(500).json({ success: false, error: '获取地址列表失败' });
  }
};

// 添加收货地址
exports.addAddress = async (req, res) => {
  try {
    const { name, phone, region, detail, isDefault = false } = req.body;
    
    const newAddress = {
      name,
      phone,
      region,
      detail,
      isDefault
    };

    const user = await User.findById(req.user._id);
    
    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      user.address.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.address.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: '地址添加成功',
      address: newAddress
    });
  } catch (error) {
    console.error('添加地址错误:', error);
    res.status(500).json({ success: false, error: '添加地址失败' });
  }
};

// 更新收货地址
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, region, detail, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    const address = user.address.id(addressId);
    
    if (!address) {
      return res.status(404).json({ success: false, error: '地址不存在' });
    }

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      user.address.forEach(addr => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, { name, phone, region, detail, isDefault });
    await user.save();

    res.json({
      success: true,
      message: '地址更新成功',
      address
    });
  } catch (error) {
    console.error('更新地址错误:', error);
    res.status(500).json({ success: false, error: '更新地址失败' });
  }
};

// 删除收货地址
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    user.address.pull({ _id: addressId });
    await user.save();

    res.json({ success: true, message: '地址删除成功' });
  } catch (error) {
    console.error('删除地址错误:', error);
    res.status(500).json({ success: false, error: '删除地址失败' });
  }
};

// 设置默认地址
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    // 先取消所有默认地址
    user.address.forEach(addr => {
      addr.isDefault = false;
    });

    // 设置指定地址为默认
    const address = user.address.id(addressId);
    if (address) {
      address.isDefault = true;
      await user.save();
      res.json({ success: true, message: '默认地址设置成功' });
    } else {
      res.status(404).json({ success: false, error: '地址不存在' });
    }
  } catch (error) {
    console.error('设置默认地址错误:', error);
    res.status(500).json({ success: false, error: '设置默认地址失败' });
  }
};