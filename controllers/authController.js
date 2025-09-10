const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const axios = require('axios');

class AuthController {
  // 用户注册
  async register(req, res) {
    try {
      console.log('📨 注册请求:', req.body);
      const { nickName, avatarUrl, phone, openId } = req.body;
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ $or: [{ phone }, { openId }] });
      if (existingUser) {
        console.log('❌ 用户已存在');
        return res.status(400).json({ success: false, error: '用户已存在' });
      }

      // 创建新用户
      const user = await User.create({
        nickName,
        avatarUrl,
        phone,
        openId
      });

      console.log('✅ 用户创建成功:', user._id);

      // 生成token
      const token = jwt.sign(
        { userId: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(200).json({
        success: true,
        message: '注册成功',
        token,
        userInfo: {
          id: user._id,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('❌ 注册失败:', error);
      res.status(500).json({ success: false, error: '注册失败: ' + error.message });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      console.log('📨 登录请求:', req.body);
      const { phone, openId } = req.body;
      
      if (!phone && !openId) {
        console.log('❌ 缺少登录参数');
        return res.status(400).json({ success: false, error: '需要手机号或openId' });
      }

      // 查找用户
      const user = await User.findOne({ $or: [{ phone }, { openId }] });
      console.log('👤 查找到的用户:', user ? user._id : 'null');
      
      if (!user) {
        console.log('❌ 用户不存在');
        return res.status(400).json({ success: false, error: '用户不存在' });
      }

      // 生成token
      const token = jwt.sign(
        { userId: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      console.log('✅ 登录成功，生成token');
      
      res.json({
        success: true,
        message: '登录成功',
        token,
        userInfo: {
          id: user._id,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('❌ 登录错误:', error);
      res.status(500).json({ success: false, error: '登录失败: ' + error.message });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-openId -__v');
      res.json({
        success: true,
        userInfo: {
          id: user._id,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          address: user.address
        }
      });
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      res.status(500).json({ success: false, error: '获取用户信息失败' });
    }
  }

  // 微信登录（修复版）
  async wechatLogin(req, res) {
    try {
      console.log('🎯 微信登录请求收到:', JSON.stringify(req.body, null, 2));
      
      const { code, nickName, avatarUrl } = req.body;
      
      if (!code) {
        console.log('❌ 缺少code参数');
        return res.status(400).json({ success: false, error: '缺少code参数' });
      }

      console.log('🔍 开始获取openId...');
      let openId;
      try {
        openId = await this.getOpenIdFromWechat(code);
        console.log('✅ openId获取成功:', openId);
      } catch (error) {
        console.error('❌ 获取openId失败:', error.message);
        return res.status(400).json({ 
          success: false, 
          error: '微信授权失败: ' + error.message 
        });
      }

      console.log('🔍 查找用户，openId:', openId);
      let user = await User.findOne({ openId });
      
      if (!user) {
        console.log('👤 用户不存在，创建新用户...');
        try {
          user = await User.create({ 
            nickName: nickName || '微信用户',
            avatarUrl: avatarUrl || '',
            openId,
            userType: 'wechat'
          });
          console.log('✅ 新用户创建成功:', user._id);
        } catch (error) {
          console.error('❌ 创建用户失败:', error.message);
          return res.status(500).json({ 
            success: false, 
            error: '用户创建失败: ' + error.message 
          });
        }
      } else {
        console.log('✅ 找到现有用户:', user._id);
        // 更新用户信息（如果需要）
        if (nickName) user.nickName = nickName;
        if (avatarUrl) user.avatarUrl = avatarUrl;
        await user.save();
      }

      console.log('🔐 生成token...');
      try {
        const token = jwt.sign(
          { userId: user._id }, 
          config.jwt.secret, 
          { expiresIn: config.jwt.expiresIn }
        );
        console.log('✅ token生成成功');
        
        res.json({
          success: true,
          message: '微信登录成功',
          token,
          userInfo: {
            id: user._id,
            nickName: user.nickName,
            avatarUrl: user.avatarUrl,
            phone: user.phone || ''
          }
        });
      } catch (error) {
        console.error('❌ 生成token失败:', error.message);
        return res.status(500).json({ 
          success: false, 
          error: 'token生成失败: ' + error.message 
        });
      }
    } catch (error) {
      console.error('🔴 微信登录未知错误:', error.message);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({ 
        success: false, 
        error: '微信登录失败: ' + error.message 
      });
    }
  }

  // 从微信获取openId（修复版）
  async getOpenIdFromWechat(code) {
    try {
      // 从环境变量获取配置
      const appid = process.env.WECHAT_APPID;
      const secret = process.env.WECHAT_SECRET;
      
      // 验证配置是否存在
      if (!appid || appid === 'wx1234567890abcdef') {
        throw new Error('微信小程序AppID未正确配置，请检查WECHAT_APPID环境变量');
      }
      
      if (!secret || secret === '7a1ca9ee72c6c0fa39f0234d620d2c75') {
        throw new Error('微信小程序Secret未正确配置，请检查WECHAT_SECRET环境变量');
      }
      
      console.log('🌐 请求微信API，appid:', appid);
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      
      console.log('请求URL:', url.replace(secret, '***')); // 安全日志
      
      const response = await axios.get(url, {
        timeout: 10000
      });
      
      console.log('微信API响应:', response.data);
      
      if (response.data.errcode) {
        // 添加具体的错误代码处理
        if (response.data.errcode === 40013) {
          throw new Error('无效的AppID，请检查微信小程序配置');
        } else if (response.data.errcode === 40125) {
          throw new Error('无效的AppSecret，请检查微信小程序配置');
        } else if (response.data.errcode === 40163) {
          throw new Error('code已被使用，请重新获取');
        }
        throw new Error(`微信接口错误：${response.data.errcode} - ${response.data.errmsg}`);
      }
      
      if (!response.data.openid) {
        throw new Error('未获取到OpenId，请检查微信小程序配置');
      }
      
      return response.data.openid;
    } catch (error) {
      console.error('❌ 微信API请求失败:', error.message);
      if (error.response) {
        console.error('微信API响应数据:', error.response.data);
        if (error.response.data.errcode === 40013) {
          throw new Error('微信小程序AppID配置错误，请检查WECHAT_APPID环境变量');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('微信API请求超时，请稍后重试');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('无法连接到微信服务器，请检查网络连接');
      }
      throw new Error('微信服务通信失败: ' + error.message);
    }
  }

  // 用户登出
  async logout(req, res) {
    res.json({ success: true, message: '登出成功' });
  }
}

// ✅ 正确导出方式
module.exports = new AuthController();