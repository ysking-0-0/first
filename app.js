// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');


// 导入路由

console.log('=== 环境变量检查 ===');
console.log('WECHAT_APPID:', process.env.WECHAT_APPID ? '已设置' : '未设置');
console.log('WECHAT_SECRET:', process.env.WECHAT_SECRET ? '已设置' : '未设置');
console.log('========================');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/order');
const bannerRoutes = require('./routes/banner');
const uploadRoutes = require('./routes/upload'); // 新增上传路由




// 导入错误处理中间件（但不立即使用）
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// ========== 标准中间件配置 ==========
app.use(helmet());
app.use(cors(config.cors));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

if (config.app.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== 路由配置 ==========



app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes); // 注册上传路由



// ========== 错误处理（必须在最后） ==========
app.use(notFound);
app.use(errorHandler);

// ========== 数据库和服务器启动 ==========
mongoose.connect(config.database.mongo.uri, {
  ...config.database.mongo.options,
  dbName: config.database.mongo.dbName
})
.then(() => {
  console.log('✅ MongoDB连接成功');
  console.log('✅ 实际连接的数据库:', mongoose.connection.db.databaseName);

})
.catch(err => {
  console.error('❌ MongoDB连接失败:', err.message);
});

// 数据库连接信息 调试

const PORT = config.app.port;
app.listen(PORT, () => {
  console.log('🚀 ' + config.app.name + ' 服务器启动成功！');
  console.log('==================================================');
  console.log('🕒 时间: ' + new Date().toLocaleString());
  console.log('\n📡 可访问的网址:');
  console.log('   • 健康检查: http://localhost:' + PORT + '/health');


  
});