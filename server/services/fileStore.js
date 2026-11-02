const crypto = require('crypto');
const pool = require('../config/db');

// ============================================
// Uploaded photos (driver bill photos) are stored in the database, not on
// disk. Hostinger replaces the app folder on every deploy, so files saved
// under server/uploads disappeared after each update.
// Each file gets a long random key; GET /api/files/<key> serves it.
// ============================================

const IMAGE_TYPES = [
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', test: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', test: (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP' },
];

// The real type from the file's first bytes; the browser-supplied type
// can't be trusted.
const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  const hit = IMAGE_TYPES.find((t) => t.test(buffer));
  return hit ? hit.mime : null;
};

const ensureFileTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT PRIMARY KEY AUTO_INCREMENT,
        file_key CHAR(48) NOT NULL UNIQUE,
        mime VARCHAR(40) NOT NULL,
        size INT NOT NULL,
        data MEDIUMBLOB NOT NULL,
        uploaded_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) DEFAULT CHARSET=utf8mb4`);
  } catch (error) {
    console.error('⚠️  Could not prepare uploaded_files table:', error.message);
  }
};

const saveImage = async (buffer, userId) => {
  const mime = detectImageType(buffer);
  if (!mime) {
    const err = new Error('Only JPG, PNG or WEBP photos are allowed');
    err.status = 400;
    throw err;
  }
  const key = crypto.randomBytes(24).toString('hex');
  await pool.query(
    'INSERT INTO uploaded_files (file_key, mime, size, data, uploaded_by) VALUES (?, ?, ?, ?, ?)',
    [key, mime, buffer.length, buffer, userId || null]
  );
  return `/api/files/${key}`;
};

// Express handler: GET /api/files/:key
const serveFile = async (req, res) => {
  try {
    const key = String(req.params.key || '');
    if (!/^[a-f0-9]{48}$/.test(key)) return res.status(404).end();
    const [rows] = await pool.query('SELECT mime, data FROM uploaded_files WHERE file_key = ?', [key]);
    if (!rows.length) return res.status(404).end();
    res.setHeader('Content-Type', rows[0].mime);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    return res.end(rows[0].data);
  } catch (error) {
    console.error('❌ serveFile:', error.message);
    return res.status(500).end();
  }
};

// Bill photo links the app accepts on a trip (new database files, or
// older files from the uploads folder).
const isAllowedPhotoUrl = (url) =>
  typeof url === 'string' && /^\/(api\/files\/[a-f0-9]{48}|uploads\/trip-bills\/[\w.-]+)$/.test(url);

module.exports = { ensureFileTable, saveImage, serveFile, isAllowedPhotoUrl, detectImageType };
