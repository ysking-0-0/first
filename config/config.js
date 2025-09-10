const path = require('path');

// 环境配置
const env = process.env.NODE_ENV || 'development';

// 基础配置
const config = {
  // 应用配置
  app: {
    name: '自家店铺小程序后端',
    version: '1.0.0',
    port: process.env.PORT || 5000,
    env: env,
    isProduction: env === 'production',
    isDevelopment: env === 'development'
  },

  // 数据库配置
  database: {
    // MongoDB 配置
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGO_DB_NAME || 'my_shop',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      }
    },

    // Redis配置（可选，用于缓存和会话）
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0
    }
  },

  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APP_ID || 'wx77dd337a594d1711',
    appSecret: process.env.WECHAT_APP_SECRET || 'f420b2128ec848f5f83f7dc43e274791',
    // 微信支付配置（如果需要）
    pay: {
      mchId: process.env.WECHAT_MCH_ID || '商户号',
      apiKey: process.env.WECHAT_API_KEY || 'API密钥',
      notifyUrl: process.env.WECHAT_NOTIFY_URL || '/api/wechat/pay/notify'
    }
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // 7天过期
    issuer: 'my-shop-backend'
  },

  // 文件上传配置
  upload: {
    // 文件存储路径
    storagePath: process.env.UPLOAD_PATH || path.join(__dirname, '../uploads'),
    // 允许的文件类型
    allowedTypes: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    // 最大文件大小（5MB）
    maxFileSize: 5 * 1024 * 1024,
    // 访问URL前缀
    baseUrl: process.env.UPLOAD_BASE_URL || '/uploads'


  },

  // 邮件配置（可选，用于通知）
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE || false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-email-password'
    }
  },

  // 短信配置（可选，用于验证码）
  sms: {
    provider: process.env.SMS_PROVIDER || 'aliyun', // aliyun, twilio等
    accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '你的店铺',
    templateCode: process.env.SMS_TEMPLATE_CODE || 'SMS_123456789'
  },

  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || [
      'https://你的小程序域名',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    credentials: true
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.LOG_FILE_ENABLED || false,
      path: process.env.LOG_FILE_PATH || path.join(__dirname, '../logs/app.log'),
      maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_FILE_MAX_FILES || '14d'
    }
  },

  // 速率限制配置
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: process.env.RATE_LIMIT_MAX || 100 // 每个IP最多100次请求
  },

  // 业务配置
  business: {
    // 订单相关配置
    order: {
      autoCancelTime: 30 * 60 * 1000, // 30分钟后自动取消未支付订单
      maxQuantityPerProduct: 99 // 单个商品最大购买数量
    },
    // 店铺配置
    shop: {

      defaultShopId: process.env.DEFAULT_SHOP_ID || '68be5c7188f8810ffe028bee'
    }
  }
};

// 环境特定配置
const environmentConfigs = {
  development: {
    database: {
      mongo: {
        uri: 'mongodb://localhost:27017/my_shop_dev'
      }
    },
    app: {
      port: 5000
    },
    logging: {
      level: 'debug'
    }
  },

  production: {
    database: {
      mongo: {
        uri: process.env.MONGO_URI // 生产环境必须通过环境变量设置
      }
    },
    app: {
      port: process.env.PORT || 80
    },
    jwt: {
      secret: process.env.JWT_SECRET // 生产环境必须设置强密钥
    },
    logging: {
      level: 'warn'
    }
  },

  test: {
    database: {
      mongo: {
        uri: 'mongodb://localhost:27017/my_shop_test'
      }
    },
    app: {
      port: 0 // 随机端口
    }
  }
};

// 合并环境特定配置
const mergedConfig = {
  ...config,
  ...(environmentConfigs[env] || {})
};

module.exports = mergedConfig;