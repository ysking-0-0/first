const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 确保上传目录存在
const ensureUploadDir = () => {
  if (!fs.existsSync(config.upload.storagePath)) {
    fs.mkdirSync(config.upload.storagePath, { recursive: true });
  }
};

// 上传单个文件
exports.uploadSingle = async (req, res) => {
  try {
    ensureUploadDir();

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
};

// 上传多个文件
exports.uploadMultiple = async (req, res) => {
  try {
    ensureUploadDir();

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
};

// 删除文件
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(config.upload.storagePath, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: '文件删除成功' });
  } catch (error) {
    console.error('删除文件错误:', error);
    res.status(500).json({ success: false, error: '文件删除失败' });
  }
};