const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// ============================================
// ACTIVITY LOG (super admin only)
// Every sign-in (successful or not) and every change made through the API
// is written to audit_logs with who did it, their role, the time, the IP
// address and the device/browser. Nothing in the app can edit or delete
// these rows; only the super admin can read them.
// ============================================

// The one super admin account, created on first start if none exists.
// Nothing about its password is kept in the code: it is read once from the
// SUPERADMIN_PASSWORD environment variable (set on the hosting panel),
// hashed with bcrypt and stored in the database. After the account exists
// the variable is ignored and can be removed.
const SUPERADMIN_SEED = {
  name: process.env.SUPERADMIN_NAME || 'Nirmaan Digital',
  email: (process.env.SUPERADMIN_EMAIL || 'nirmaandigital01@gmail.com').trim().toLowerCase(),
  // Sign-in username (the phone number field on the login page).
  phone: (process.env.SUPERADMIN_PHONE || '9363939199').replace(/\D/g, '').slice(-10),
};

const SENSITIVE = /pass(word)?|token|secret|otp|authorization|cookie|key|signature|card|cvv|subscription/i;

// Request bodies are stored with secrets masked and long values trimmed.
const redact = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (depth > 4) return '[…]';
  if (Array.isArray(value)) return value.slice(0, 25).map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 40)) {
      out[k] = SENSITIVE.test(k) ? '••••••' : redact(v, depth + 1);
    }
    return out;
  }
  if (typeof value === 'string' && value.length > 300) return `${value.slice(0, 300)}…`;
  return value;
};

// Real visitor IP. server.js sets "trust proxy" for Hostinger's proxy, so
// req.ip is the address of the person, not of the proxy.
const clientIp = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || '';
  return ip.replace(/^::ffff:/, '').slice(0, 64);
};

const ensureAuditSchema = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actor_id INT NULL,
        actor_name VARCHAR(120) NULL,
        actor_role VARCHAR(20) NULL,
        action VARCHAR(80) NOT NULL,
        category VARCHAR(30) NOT NULL DEFAULT 'change',
        summary VARCHAR(400) NULL,
        target_type VARCHAR(40) NULL,
        target_id VARCHAR(40) NULL,
        target_name VARCHAR(160) NULL,
        method VARCHAR(10) NULL,
        path VARCHAR(255) NULL,
        status_code SMALLINT NULL,
        success TINYINT(1) NOT NULL DEFAULT 1,
        ip VARCHAR(64) NULL,
        user_agent VARCHAR(300) NULL,
        details TEXT NULL,
        INDEX idx_audit_time (created_at),
        INDEX idx_audit_actor (actor_id, created_at),
        INDEX idx_audit_category (category, created_at),
        INDEX idx_audit_ip (ip)
      ) DEFAULT CHARSET=utf8mb4`);

    // users.role must allow 'superadmin'; keep whatever other roles exist.
    const [[col]] = await pool.query(
      `SELECT COLUMN_TYPE AS type FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`
    );
    if (col && /^enum\(/i.test(col.type) && !/'superadmin'/.test(col.type)) {
      const values = col.type.replace(/^enum\(|\)$/gi, '');
      await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM(${values}, 'superadmin') NOT NULL`);
    }
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );
    if (!cols.some((c) => c.COLUMN_NAME === 'last_login_ip')) {
      await pool.query('ALTER TABLE users ADD COLUMN last_login_ip VARCHAR(64) NULL');
    }
    // When the password last changed, in milliseconds (no timezone
    // ambiguity); sessions started before it are refused.
    if (!cols.some((c) => c.COLUMN_NAME === 'password_changed_ms')) {
      await pool.query('ALTER TABLE users ADD COLUMN password_changed_ms BIGINT NULL');
    }

    const [existing] = await pool.query("SELECT id, phone FROM users WHERE role = 'superadmin' LIMIT 1");
    // An account made by the first version of this update has the
    // placeholder phone 'superadmin': give it the real sign-in number.
    if (existing.length && existing[0].phone !== SUPERADMIN_SEED.phone && !/^\d{10}$/.test(existing[0].phone || '')) {
      const [taken] = await pool.query('SELECT id FROM users WHERE phone = ? AND id != ?', [SUPERADMIN_SEED.phone, existing[0].id]);
      if (taken.length) {
        console.warn(`⚠️  Super admin sign-in number ${SUPERADMIN_SEED.phone} is already used by another account.`);
      } else {
        await pool.query('UPDATE users SET phone = ? WHERE id = ?', [SUPERADMIN_SEED.phone, existing[0].id]);
      }
    }
    if (!existing.length) {
      const password = process.env.SUPERADMIN_PASSWORD || '';
      if (password.length < 8) {
        console.warn('⚠️  No super admin yet: set SUPERADMIN_PASSWORD (8+ characters) and restart to create it.');
      } else {
        const hash = await bcrypt.hash(password, 12);
        // If the number or email already belongs to an account, that account
        // becomes the super admin; otherwise a new one is created.
        const [found] = await pool.query(
          'SELECT id FROM users WHERE phone = ? OR LOWER(email) = ? ORDER BY phone = ? DESC LIMIT 1',
          [SUPERADMIN_SEED.phone, SUPERADMIN_SEED.email, SUPERADMIN_SEED.phone]
        );
        if (found.length) {
          await pool.query(
            "UPDATE users SET role = 'superadmin', status = 'active', password = ?, phone = ? WHERE id = ?",
            [hash, SUPERADMIN_SEED.phone, found[0].id]
          );
        } else {
          await pool.query(
            `INSERT INTO users (name, email, phone, password, role, status)
             VALUES (?, ?, ?, ?, 'superadmin', 'active')`,
            [SUPERADMIN_SEED.name, SUPERADMIN_SEED.email, SUPERADMIN_SEED.phone, hash]
          );
        }
        console.log('✅ Super admin account created — SUPERADMIN_PASSWORD can now be removed from the settings');
      }
    }
  } catch (error) {
    console.error('⚠️  Could not prepare the activity log:', error.message);
  }
};

/**
 * Write one activity row. Never throws: recording must not break the
 * action being recorded.
 */
const record = async (req, entry) => {
  try {
    const actor = entry.actor || req?.user || null;
    await pool.query(
      `INSERT INTO audit_logs
         (actor_id, actor_name, actor_role, action, category, summary, target_type, target_id, target_name,
          method, path, status_code, success, ip, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actor?.id || null,
        actor?.name ? String(actor.name).slice(0, 120) : null,
        actor ? actor.actualRole || actor.role || null : null,
        String(entry.action || 'Activity').slice(0, 80),
        entry.category || 'change',
        entry.summary ? String(entry.summary).slice(0, 400) : null,
        entry.target?.type || null,
        entry.target?.id !== undefined && entry.target?.id !== null ? String(entry.target.id).slice(0, 40) : null,
        entry.target?.name ? String(entry.target.name).slice(0, 160) : null,
        req?.method || null,
        req ? String(req.originalUrl || '').split('?')[0].slice(0, 255) : null,
        entry.statusCode || null,
        entry.success === false ? 0 : 1,
        req ? clientIp(req) : null,
        req ? String(req.get?.('user-agent') || '').slice(0, 300) : null,
        entry.details ? JSON.stringify(redact(entry.details)).slice(0, 8000) : null,
      ]
    );
  } catch (error) {
    console.error('⚠️  Activity not recorded:', error.message);
  }
};

// Readable names for API changes. First match wins.
const ACTIONS = [
  [/^POST \/api\/orders\/payments$/, 'Recorded a payment', 'payment'],
  [/^POST \/api\/orders$/, 'Placed an order', 'order'],
  [/^(PUT|PATCH) \/api\/orders\/\d+\/status$/, 'Changed order status', 'order'],
  [/^(PUT|PATCH|DELETE) \/api\/orders\//, 'Changed an order', 'order'],
  [/^PATCH \/api\/users\/\d+\/password$/, 'Changed a user password', 'security'],
  [/^PATCH \/api\/users\/\d+\/status$/, 'Changed user status', 'user'],
  [/^POST \/api\/users$/, 'Created a user', 'user'],
  [/^PUT \/api\/users\//, 'Edited a user', 'user'],
  [/^DELETE \/api\/users\//, 'Deleted a user', 'user'],
  [/^PUT \/api\/settings\/password$/, 'Changed own password', 'security'],
  [/^PUT \/api\/settings\/account$/, 'Edited own profile', 'user'],
  [/^PUT \/api\/settings\/business$/, 'Changed business settings', 'settings'],
  [/^\w+ \/api\/superadmin\/accounts\/\d+\/password$/, 'Changed an account password', 'security'],
  [/^\w+ \/api\/superadmin\/accounts\/\d+\/status$/, 'Changed account status', 'security'],
  [/^\w+ \/api\/pricing/, 'Changed pricing', 'pricing'],
  [/^\w+ \/api\/retailers/, 'Changed a customer', 'customer'],
  [/^\w+ \/api\/staff/, 'Changed staff', 'staff'],
  [/^\w+ \/api\/vehicles/, 'Changed a vehicle', 'staff'],
  [/^\w+ \/api\/salaries\/advance$/, 'Recorded a salary advance', 'salary'],
  [/^\w+ \/api\/salaries\/daily-salary$/, 'Changed a daily salary', 'salary'],
  [/^\w+ \/api\/expenses/, 'Changed expenses', 'expense'],
  [/^\w+ \/api\/deliveries\/assign-trip$/, 'Assigned a trip', 'delivery'],
  [/^\w+ \/api\/deliveries/, 'Changed a delivery', 'delivery'],
  [/^\w+ \/api\/driver\/trip\/status$/, 'Updated a trip (driver)', 'delivery'],
  [/^\w+ \/api\/driver\/upload-photo$/, 'Uploaded a bill photo', 'delivery'],
  [/^\w+ \/api\/cash-verification\/verify$/, 'Verified driver cash', 'payment'],
  [/^\w+ \/api\/payments\/checkout$/, 'Started an online payment', 'payment'],
  [/^\w+ \/api\/payments\/cancel\//, 'Cancelled an online payment', 'payment'],
  [/^\w+ \/api\/payments\/\d+\/invoice-link$/, 'Opened an invoice link', 'download'],
  [/^GET \/api\/payments\/\d+\/invoice$/, 'Downloaded an invoice', 'download'],
  [/^GET \/api\/reports\/export$/, 'Exported a sales report', 'download'],
];

// Requests that are not worth a row (or are recorded elsewhere).
// Notification registration happens automatically each time the app opens,
// so it is routine noise rather than something a person did.
const SKIP = [/^\/api\/auth\/login$/, /^\/api\/payments\/webhook$/, /^\/api\/notifications\//];

// Express middleware: records every change (POST/PUT/PATCH/DELETE) and the
// downloads listed above, once the response has been sent.
const auditRequests = (req, res, next) => {
  const path = String(req.originalUrl || '').split('?')[0];
  if (!path.startsWith('/api/') || SKIP.some((re) => re.test(path))) return next();
  const key = `${req.method} ${path}`;
  const match = ACTIONS.find(([re]) => re.test(key));
  const isWrite = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (!isWrite && !match) return next();

  res.on('finish', () => {
    // Only signed-in actions; anonymous calls are refused before doing anything.
    if (!req.user) return;
    const [, label, category] = match || [null, `${req.method} ${path}`, 'change'];
    const ok = res.statusCode < 400;
    const idMatch = path.match(/\/(\d+)(?:\/|$)/);
    record(req, {
      action: label,
      category,
      statusCode: res.statusCode,
      success: ok,
      summary: req.auditSummary || (ok ? null : `Failed (${res.statusCode})`),
      target: req.auditTarget || (idMatch ? { type: path.split('/')[2], id: idMatch[1] } : null),
      details: isWrite && req.is?.('application/json') ? { body: req.body } : null,
    });
  });
  next();
};

module.exports = { ensureAuditSchema, record, auditRequests, clientIp, redact };
