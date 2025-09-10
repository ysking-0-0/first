const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middlewares/authMiddleware');
const config = require('../config/config');

const router = express.Router();

// 确保上传目录存在
const uploadDir = config.upload.storagePath;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = config.upload.allowedTypes || ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${ext}`), false);
  }
};

// 创建 multer 实例
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize || 5 * 1024 * 1024 // 默认5MB
  },
  fileFilter
});

// 上传单个文件
router.post('/single', authenticate, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    const fileUrl = `${config.upload.baseUrl}/${req.file.filename}`;
    
    res.json({
      success: true,
      message: '文件上传成功',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('上传文件错误:', error);
    res.status(500).json({ success: false, error: '文件上传失败' });
  }
});

// 上传多个文件
router.post('/multiple', authenticate, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${config.upload.baseUrl}/${file.filename}`
    }));

    res.json({
      success: true,
      message: '文件上传成功',
      files
    });
  } catch (error) {
    console.error('上传多个文件错误:', error);
    res.status(500).json({ success: false, error: '文件上传失败' });
  }
});

// 删除文件
router.delete('/:filename', authenticate, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: '文件删除成功' });
  } catch (error) {
    console.error('删除文件错误:', error);
    res.status(500).json({ success: false, error: '文件删除失败' });
  }
});

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: '文件大小超过限制' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, error: '文件数量超过限制' });
    }
  }
  res.status(400).json({ success: false, error: error.message });
});

module.exports = router;