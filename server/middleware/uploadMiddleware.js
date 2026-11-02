// ============================================
// uploadMiddleware.js
//
// Bill photos from drivers (diesel bills, etc). Kept in memory and then
// saved to the database by services/fileStore.js — files on disk were lost
// on every Hostinger deploy.
// ============================================
const multer = require('multer');

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
});

module.exports = upload;
