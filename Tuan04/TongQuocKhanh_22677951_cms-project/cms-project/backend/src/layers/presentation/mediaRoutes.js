const router       = require('express').Router();
const multer       = require('multer');
const path         = require('path');
const { v4: uuidv4 } = require('uuid');
const mediaService = require('../domain/MediaService');
const { authenticate, requireRole } = require('../application/middleware');

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /jpeg|jpg|png|gif|webp|pdf|svg/.test(file.mimetype)),
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    res.json(await mediaService.findAll(+(req.query.page||1), +(req.query.limit||20)));
  } catch (err) { next(err); }
});

router.post('/upload', authenticate, requireRole('admin','editor'),
  upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      res.status(201).json(await mediaService.save(req.file, req.user.id));
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    await mediaService.delete(req.params.id);
    res.json({ message: 'Media deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
