const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) =>  {
    const uploadPath = path.join(uploadsDir, req.params.type || 'general');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Upload receipt for payment
router.post('/receipt/:paymentId', 
  authenticateToken,
  upload.single('receipt'),
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Update payment record with receipt filename
      const result = await pool.query(
        'UPDATE payments SET receipt_file_name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [req.file.filename, paymentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({
        message: 'Receipt uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname
      });

    } catch (error) {
      console.error('Error uploading receipt:', error);
      res.status(500).json({ error: 'Failed to upload receipt' });
    }
  }
);

// Upload report file
router.post('/report', 
  authenticateToken,
  upload.single('report'),
  async (req, res) => {
    try {
      const { title, description, uploadedBy, uploadedByName } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!title || !uploadedBy || !uploadedByName) {
        return res.status(400).json({ error: 'Title, uploadedBy, and uploadedByName are required' });
      }

      // Save report record to database
      const result = await pool.query(`
        INSERT INTO reports (title, description, file_name, file_path, uploaded_by, uploaded_by_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [title, description, req.file.filename, req.file.path, uploadedBy, uploadedByName]);

      res.status(201).json({
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        fileName: result.rows[0].file_name,
        uploadDate: result.rows[0].upload_date?.toISOString().split('T')[0].split('-').reverse().join('/'),
        uploadedBy: result.rows[0].uploaded_by,
        uploadedByName: result.rows[0].uploaded_by_name
      });

    } catch (error) {
      console.error('Error uploading report:', error);
      res.status(500).json({ error: 'Failed to upload report' });
    }
  }
);

// Download file
router.get('/download/:type/:filename', authenticateToken, (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Get file info
router.get('/info/:type/:filename', authenticateToken, (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    
    res.json({
      filename,
      size: stats.size,
      uploadDate: stats.birthtime,
      lastModified: stats.mtime
    });
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

module.exports = router;