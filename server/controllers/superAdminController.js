const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { computePaymentStats } = require('./paymentController');
const { setPassword } = require('./userController');
const { forgetAccount } = require('../middleware/auth');

// ============================================
// SUPER ADMIN (Security section). Every route here is behind
// requireSuperAdmin; changes made here are themselves recorded in the
// activity log by the audit middleware.
// ============================================

const n = (v) => Math.round((parseFloat(v) || 0) * 100) / 100;

// GET /api/superadmin/overview
exports.getOverview = async (req, res) => {
  try {
    const finance = await computePaymentStats();

    const [[orders]] = await pool.query(`
      SELECT
        SUM(created_at >= CURDATE()) AS today_count,
        COALESCE(SUM(CASE WHEN created_at >= CURDATE() THEN total_amount END), 0) AS today_amount,
        SUM(created_at >= CURDATE() - INTERVAL 6 DAY) AS week_count,
        COALESCE(SUM(CASE WHEN created_at >= CURDATE() - INTERVAL 6 DAY THEN total_amount END), 0) AS week_amount,
        SUM(created_at >= CURDATE() - INTERVAL 29 DAY) AS month_count,
        COALESCE(SUM(CASE WHEN created_at >= CURDATE() - INTERVAL 29 DAY THEN total_amount END), 0) AS month_amount,
        SUM(order_status IN ('pending', 'confirmed', 'processing')) AS open_count
      FROM orders WHERE order_status != 'cancelled'`);
    const [byStatus] = await pool.query(
      'SELECT order_status AS status, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS amount FROM orders GROUP BY order_status'
    );

    // Last 30 days: amount billed (orders) and amount paid (recorded payments) per day.
    const [billedDays] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COALESCE(SUM(total_amount), 0) AS amount
        FROM orders WHERE order_status != 'cancelled' AND created_at >= CURDATE() - INTERVAL 29 DAY
       GROUP BY day`);
    const [paidDays] = await pool.query(`
      SELECT DATE_FORMAT(date, '%Y-%m-%d') AS day, COALESCE(SUM(amount), 0) AS amount
        FROM payments WHERE date >= CURDATE() - INTERVAL 29 DAY GROUP BY day`);
    const billedMap = new Map(billedDays.map((r) => [r.day, n(r.amount)]));
    const paidMap = new Map(paidDays.map((r) => [r.day, n(r.amount)]));
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() + 5.5 * 3600 * 1000 - i * 86400000).toISOString().slice(0, 10);
      trend.push({ day: d, billed: billedMap.get(d) || 0, paid: paidMap.get(d) || 0 });
    }

    const [topDues] = await pool.query(
      `SELECT shop_name, owner_name, phone, outstanding FROM retailers
        WHERE outstanding >= 1 ORDER BY outstanding DESC LIMIT 5`
    );

    const [roles] = await pool.query(`
      SELECT role, COUNT(*) AS total, SUM(status = 'active') AS active,
             SUM(last_login >= NOW() - INTERVAL 7 DAY) AS recent
        FROM users GROUP BY role`);

    const [[security]] = await pool.query(`
      SELECT
        SUM(category = 'login' AND success = 1 AND created_at >= CURDATE()) AS logins_today,
        SUM(category = 'login' AND success = 0 AND created_at >= CURDATE()) AS failed_today,
        SUM(category = 'login' AND success = 0 AND created_at >= NOW() - INTERVAL 1 DAY) AS failed_24h,
        SUM(category = 'security' AND created_at >= NOW() - INTERVAL 30 DAY) AS password_changes_30d,
        SUM(category != 'login' AND created_at >= CURDATE()) AS changes_today
      FROM audit_logs WHERE created_at >= NOW() - INTERVAL 30 DAY`);
    const [failedIps] = await pool.query(`
      SELECT ip, COUNT(*) AS attempts, MAX(created_at) AS last_at
        FROM audit_logs
       WHERE category = 'login' AND success = 0 AND created_at >= NOW() - INTERVAL 1 DAY
       GROUP BY ip ORDER BY attempts DESC LIMIT 5`);
    const [recent] = await pool.query(
      `SELECT id, created_at, actor_name, actor_role, action, category, summary, target_name, success, ip
         FROM audit_logs ORDER BY id DESC LIMIT 12`
    );

    res.json({
      success: true,
      data: {
        finance,
        orders: {
          today: { count: Number(orders.today_count) || 0, amount: n(orders.today_amount) },
          week: { count: Number(orders.week_count) || 0, amount: n(orders.week_amount) },
          month: { count: Number(orders.month_count) || 0, amount: n(orders.month_amount) },
          open: Number(orders.open_count) || 0,
          byStatus: byStatus.map((r) => ({ status: r.status, count: Number(r.count), amount: n(r.amount) })),
        },
        trend,
        topDues: topDues.map((r) => ({ ...r, outstanding: n(r.outstanding) })),
        users: roles.map((r) => ({
          role: r.role,
          total: Number(r.total) || 0,
          active: Number(r.active) || 0,
          recent: Number(r.recent) || 0,
        })),
        security: {
          loginsToday: Number(security.logins_today) || 0,
          failedToday: Number(security.failed_today) || 0,
          failed24h: Number(security.failed_24h) || 0,
          passwordChanges30d: Number(security.password_changes_30d) || 0,
          changesToday: Number(security.changes_today) || 0,
          failedIps,
        },
        recent,
      },
    });
  } catch (error) {
    console.error('❌ superadmin overview:', error);
    res.status(500).json({ success: false, message: 'Could not load the dashboard' });
  }
};

// GET /api/superadmin/activity?q=&category=&actorId=&success=&from=&to=&page=&limit=
exports.getActivity = async (req, res) => {
  try {
    const where = [];
    const params = [];
    const { q, category, actorId, success, from, to } = req.query;
    if (category && /^[a-z]+$/.test(category)) {
      where.push('category = ?');
      params.push(category);
    }
    if (actorId && /^\d+$/.test(actorId)) {
      where.push('(actor_id = ? OR target_id = ?)');
      params.push(Number(actorId), String(actorId));
    }
    if (success === '0' || success === '1') {
      where.push('success = ?');
      params.push(Number(success));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(from || '')) {
      where.push('created_at >= ?');
      params.push(`${from} 00:00:00`);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to || '')) {
      where.push('created_at < ? + INTERVAL 1 DAY');
      params.push(`${to} 00:00:00`);
    }
    if (q && String(q).trim()) {
      const like = `%${String(q).trim().slice(0, 80)}%`;
      where.push('(actor_name LIKE ? OR action LIKE ? OR summary LIKE ? OR target_name LIKE ? OR ip LIKE ? OR path LIKE ?)');
      params.push(like, like, like, like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = Math.min(200, Math.max(10, parseInt(req.query.limit, 10) || 50));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM audit_logs ${whereSql}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM audit_logs ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    res.json({
      success: true,
      data: rows.map((r) => ({ ...r, details: r.details ? safeJson(r.details) : null })),
      total: Number(total) || 0,
      page,
      pages: Math.max(1, Math.ceil((Number(total) || 0) / limit)),
    });
  } catch (error) {
    console.error('❌ superadmin activity:', error);
    res.status(500).json({ success: false, message: 'Could not load the activity log' });
  }
};

const safeJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// GET /api/superadmin/accounts — every account, including admins and the super admin.
exports.getAccounts = async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await pool.query(
        `SELECT id, name, phone, email, role, status, last_login, last_login_ip, created_at
           FROM users ORDER BY FIELD(role, 'superadmin', 'admin', 'staff', 'driver', 'retailer'), name`
      );
    } catch {
      [rows] = await pool.query(
        `SELECT id, name, phone, email, role, status, last_login, NULL AS last_login_ip, created_at
           FROM users ORDER BY FIELD(role, 'superadmin', 'admin', 'staff', 'driver', 'retailer'), name`
      );
    }
    const [activity] = await pool.query(
      `SELECT actor_id, COUNT(*) AS actions, MAX(created_at) AS last_activity
         FROM audit_logs WHERE actor_id IS NOT NULL AND category != 'login'
        GROUP BY actor_id`
    );
    const byActor = new Map(activity.map((a) => [a.actor_id, a]));
    res.json({
      success: true,
      data: rows.map((u) => ({
        ...u,
        actions: Number(byActor.get(u.id)?.actions) || 0,
        last_activity: byActor.get(u.id)?.last_activity || null,
        is_you: u.id === req.user.id,
      })),
    });
  } catch (error) {
    console.error('❌ superadmin accounts:', error);
    res.status(500).json({ success: false, message: 'Could not load accounts' });
  }
};

const loadAccount = async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, role, password FROM users WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    res.status(404).json({ success: false, message: 'Account not found' });
    return null;
  }
  req.auditTarget = { type: 'user', id: rows[0].id, name: `${rows[0].name} (${rows[0].role})` };
  return rows[0];
};

// PUT /api/superadmin/accounts/:id/password  { newPassword, currentPassword? }
// Any account (admin, super admin, retailer, driver). Changing your own
// password needs the current one. The account is signed out everywhere.
exports.changePassword = async (req, res) => {
  try {
    const account = await loadAccount(req, res);
    if (!account) return;
    const { newPassword, currentPassword } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
      return res.status(400).json({ success: false, message: 'Use at least 8 characters for the new password' });
    }
    const self = account.id === req.user.id;
    if (self) {
      if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, account.password))) {
        req.auditSummary = 'Current password was wrong';
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }
    await setPassword(account.id, await bcrypt.hash(newPassword, 12));
    req.auditSummary = self ? 'Changed own password' : `New password set for ${account.name}`;
    res.json({
      success: true,
      self,
      message: self
        ? 'Your password has been changed. Please sign in again with the new password.'
        : `Password changed for ${account.name}. They have been signed out of all devices.`,
    });
  } catch (error) {
    console.error('❌ superadmin password:', error);
    res.status(500).json({ success: false, message: 'Could not change the password' });
  }
};

// PATCH /api/superadmin/accounts/:id/status  { status: 'active' | 'inactive' }
exports.changeStatus = async (req, res) => {
  try {
    const account = await loadAccount(req, res);
    if (!account) return;
    const { status } = req.body || {};
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    if (account.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'The super admin account cannot be deactivated' });
    }
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, account.id]);
    forgetAccount(account.id);
    req.auditSummary = `${account.name} is now ${status}`;
    res.json({ success: true, message: `${account.name} is now ${status}` });
  } catch (error) {
    console.error('❌ superadmin status:', error);
    res.status(500).json({ success: false, message: 'Could not change the status' });
  }
};
