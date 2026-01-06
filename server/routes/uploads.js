const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  console.log(`[UPLOADS ROUTER] ${req.method} ${req.path}`);
  next();
});
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']; // Added video mimes
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP images, MP4, WebM, and MOV videos are allowed'));
    }
  }
});

// General uploads (admin-only)
router.post('/', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  const rel = `/uploads/${req.file.filename}`;
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const absolute = `${base}${rel}`;
  const apiUrl = `/api${rel}`; // same-origin path exposed by this server
  // Return both for maximum compatibility; frontends should prefer 'apiUrl' to avoid mixed-content and localhost issues
  return res.json({ ok: true, url: apiUrl, rel, absolute });
});

// Review image uploads (authenticated users)
router.post('/images', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
    const rel = `/uploads/${req.file.filename}`;
    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const absolute = `${base}${rel}`;
    const apiUrl = `/api${rel}`;
    return res.json({ ok: true, url: apiUrl, rel, absolute });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: e.message || 'Upload failed' });
  }
});

// Admin video uploads
const uploadMiddleware = upload.single('file');

router.post('/admin/video', requireAuth, requireAdmin, (req, res, next) => {
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('[MULTER ERROR]', err);
      return res.status(400).json({ ok: false, message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('[UNKNOWN UPLOAD ERROR]', err);
      return res.status(500).json({ ok: false, message: err.message });
    }
    next();
  });
}, (req, res) => {
  console.log('[VIDEO UPLOAD] req.file:', req.file);
  console.log('[VIDEO UPLOAD] req.body:', req.body);
  if (!req.file) return res.status(400).json({ ok: false, message: 'No video file uploaded' });
  const rel = `/uploads/${req.file.filename}`;
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const absolute = `${base}${rel}`;
  const apiUrl = `/api${rel}`;
  return res.json({ ok: true, url: apiUrl, rel, absolute });
});

module.exports = router;
