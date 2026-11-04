const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');
const { JWT_SECRET } = require('../config/jwt');

// ============================================
// PAYMENT INVOICES
// Every payment gets a branded PDF invoice showing what the customer owed
// before the payment, what they paid, and what is still due afterwards.
//
// - snapshotBalance(): called inside each payment transaction so the
//   before/after balances are stored on the payment row at that moment.
// - Older payments (made before these columns existed) get the figures
//   worked out from the payment and order history instead.
// - renderInvoicePdf(): draws the invoice in the website's colours/fonts.
// ============================================

const PAID_THRESHOLD = 1; // a balance under ₹1 counts as cleared (same as orders)
const ASSETS = path.join(__dirname, '..', 'assets', 'invoice');

const COLORS = {
  ink: '#1f1915',
  muted: '#7a6e62',
  line: '#ece3d4',
  cream: '#fbf8f2',
  ivory: '#fffdf8',
  brand: '#a61b24',
  brandDark: '#7a1219',
  brandSoft: '#fbeceb',
  gold: '#c9973f',
  goldLight: '#e9c77b',
  goldDark: '#9a7128',
  goldSoft: '#fbf3e2',
  coal: '#15110e',
  coal2: '#221b16',
  success: '#1e7a4c',
  successSoft: '#e8f4ec',
};

const DEFAULT_BUSINESS = {
  businessName: 'Bismillah Chicken Center',
  phone: '',
  email: 'support@bismillahchickencenter.com',
  address: 'Bhimavaram, Andhra Pradesh',
  gstin: '',
};

const METHOD_LABELS = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  online: 'Online',
};

// ---------- Schema ----------
const ensureInvoiceColumns = async () => {
  try {
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments'`
    );
    const have = new Set(cols.map((c) => c.COLUMN_NAME));
    const add = [];
    if (!have.has('balance_before')) add.push('ADD COLUMN balance_before DECIMAL(12,2) NULL');
    if (!have.has('balance_after')) add.push('ADD COLUMN balance_after DECIMAL(12,2) NULL');
    if (!have.has('allocations')) add.push('ADD COLUMN allocations TEXT NULL');
    if (add.length) {
      await pool.query(`ALTER TABLE payments ${add.join(', ')}`);
      console.log('✅ Payments table ready for invoices');
    }
    await backfillBalances();
  } catch (error) {
    console.error('⚠️  Could not prepare invoice columns:', error.message);
  }
};

// ---------- Balance snapshot (inside a payment transaction) ----------
const currentOutstanding = async (db, retailerId) => {
  const [[{ outstanding }]] = await db.query(
    `SELECT (
        COALESCE((SELECT remaining_amount FROM retailer_opening_balances WHERE retailer_id = ?), 0) +
        COALESCE((SELECT SUM(balance) FROM orders WHERE retailer_id = ? AND order_status != 'cancelled' AND balance >= ?), 0)
     ) AS outstanding`,
    [retailerId, retailerId, PAID_THRESHOLD]
  );
  return parseFloat(outstanding) || 0;
};

// Call after the payment has been applied to the bills. Never fails the
// payment: if anything goes wrong the invoice falls back to history.
const snapshotBalance = async (connection, { paymentId, retailerId, amount, allocations }) => {
  try {
    const after = await currentOutstanding(connection, retailerId);
    const before = parseFloat((after + (parseFloat(amount) || 0)).toFixed(2));
    await connection.query(
      'UPDATE payments SET balance_before = ?, balance_after = ?, allocations = ? WHERE id = ?',
      [before, after, allocations && allocations.length ? JSON.stringify(allocations) : null, paymentId]
    );
  } catch (error) {
    console.error('⚠️  Invoice balance snapshot skipped:', error.message);
  }
};

// Recalculate every shop's saved outstanding from its opening balance and
// unpaid bills (one statement). Older code paths adjusted the saved figure
// by adding/subtracting, so it could drift from the real amount.
const syncAllOutstanding = async () => {
  try {
    await pool.query(
      `UPDATE retailers r SET r.outstanding = (
          COALESCE((SELECT ob.remaining_amount FROM retailer_opening_balances ob
                     WHERE ob.retailer_id = r.id AND ob.remaining_amount >= ?), 0) +
          COALESCE((SELECT SUM(o.balance) FROM orders o
                     WHERE o.retailer_id = r.id AND o.order_status != 'cancelled' AND o.balance >= ?), 0)
       )`,
      [PAID_THRESHOLD, PAID_THRESHOLD]
    );
  } catch (error) {
    console.error('⚠️  Outstanding refresh skipped:', error.message);
  }
};

// ---------- Business details (Settings page) ----------
const getBusiness = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'business'"
    );
    if (rows.length) return { ...DEFAULT_BUSINESS, ...JSON.parse(rows[0].setting_value) };
  } catch {
    /* table not created yet — use defaults */
  }
  return { ...DEFAULT_BUSINESS };
};

const saveBusiness = async (values) => {
  const clean = {};
  for (const key of Object.keys(DEFAULT_BUSINESS)) {
    clean[key] = typeof values[key] === 'string' ? values[key].trim().slice(0, 300) : DEFAULT_BUSINESS[key];
  }
  clean.gstin = clean.gstin.toUpperCase().replace(/\s+/g, '').slice(0, 15);
  if (!clean.businessName) clean.businessName = DEFAULT_BUSINESS.businessName;
  await pool.query(
    `INSERT INTO app_settings (setting_key, setting_value) VALUES ('business', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [JSON.stringify(clean)]
  );
  return clean;
};

// ---------- Access ----------
// Admins: every payment. Retailers: their own. Drivers: cash they collected
// on one of their trips.
const canAccess = async (user, payment) => {
  if (user.role === 'admin') return true;
  if (user.role === 'retailer') {
    const [rows] = await pool.query('SELECT id FROM retailers WHERE user_id = ?', [user.id]);
    return rows.some((r) => r.id === payment.retailer_id);
  }
  if (user.role === 'driver' && payment.order_id) {
    const [rows] = await pool.query(
      `SELECT 1 FROM trip_orders tos
         JOIN trips t ON t.id = tos.trip_id
         JOIN drivers d ON d.id = t.driver_id
        WHERE tos.order_id = ? AND d.user_id = ? LIMIT 1`,
      [payment.order_id, user.id]
    );
    return rows.length > 0;
  }
  return false;
};

// Short-lived download links, so the Android app can hand the file to the
// phone's browser. Signed with a key derived from JWT_SECRET, so a link can
// never be used as a login token (and a login token can't open a link).
const LINK_KEY = crypto.createHmac('sha256', JWT_SECRET).update('payment-invoice-links').digest('hex');

const createDownloadToken = (paymentId) =>
  jwt.sign({ pid: Number(paymentId), purpose: 'invoice' }, LINK_KEY, { expiresIn: '10m', algorithm: 'HS256' });

const verifyDownloadToken = (token, paymentId) => {
  try {
    const data = jwt.verify(token, LINK_KEY, { algorithms: ['HS256'] });
    return data.purpose === 'invoice' && data.pid === Number(paymentId);
  } catch {
    return false;
  }
};

// ---------- Data ----------
const loadPayment = async (paymentId) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.order_number, o.order_date AS order_date,
            r.shop_name, r.owner_name, r.phone AS retailer_phone, r.email AS retailer_email,
            r.address AS retailer_address, r.area, r.city, r.pincode
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN retailers r ON r.id = p.retailer_id
      WHERE p.id = ?`,
    [paymentId]
  );
  return rows[0] || null;
};

// Balances for payments recorded before snapshots existed: start from what
// is owed today and step back through everything that happened since.
const reconstructBalances = async (payment) => {
  const amount = parseFloat(payment.amount) || 0;
  const now = await currentOutstanding(pool, payment.retailer_id);
  const [[later]] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS paid FROM payments
      WHERE retailer_id = ? AND (date > ? OR (date = ? AND id > ?))`,
    [payment.retailer_id, payment.date, payment.date, payment.id]
  );
  const [[billed]] = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) AS billed FROM orders
      WHERE retailer_id = ? AND order_status != 'cancelled' AND order_date > ?`,
    [payment.retailer_id, payment.date]
  );
  const after = Math.max(0, now + (parseFloat(later.paid) || 0) - (parseFloat(billed.billed) || 0));
  return { before: parseFloat((after + amount).toFixed(2)), after: parseFloat(after.toFixed(2)) };
};

// One-off: payments recorded before snapshots existed get their balances
// worked out once, so lists and invoices show the same figures.
const backfillBalances = async () => {
  const [rows] = await pool.query(
    `SELECT id, retailer_id, amount, date FROM payments
      WHERE balance_before IS NULL OR balance_after IS NULL
      ORDER BY id LIMIT 5000`
  );
  for (const payment of rows) {
    const { before, after } = await reconstructBalances(payment);
    await pool.query(
      'UPDATE payments SET balance_before = ?, balance_after = ? WHERE id = ? AND balance_before IS NULL',
      [before, after, payment.id]
    );
  }
  if (rows.length) console.log(`✅ Invoice balances filled in for ${rows.length} earlier payments`);
};

const parseAllocations = (raw) => {
  if (!raw) return [];
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const loadAllocations = async (payment) => {
  let list = parseAllocations(payment.allocations);
  if (!list.length && payment.method === 'online') {
    const [rows] = await pool.query('SELECT allocations FROM payment_transactions WHERE payment_id = ? LIMIT 1', [payment.id]);
    if (rows.length) list = parseAllocations(rows[0].allocations);
  }
  if (!list.length && payment.order_number) {
    list = [{ order_number: payment.order_number, amount: parseFloat(payment.amount) }];
  }
  const numbers = list.map((a) => a.order_number).filter((n) => n && n !== 'OPENING');
  const dates = {};
  if (numbers.length) {
    const [rows] = await pool.query(
      'SELECT order_number, order_date, total_amount FROM orders WHERE order_number IN (?)',
      [numbers]
    );
    rows.forEach((r) => (dates[r.order_number] = r));
  }
  return list.map((a) => ({
    label: a.order_number === 'OPENING' ? 'Opening balance' : a.order_number,
    date: dates[a.order_number]?.order_date || null,
    billTotal: dates[a.order_number] ? parseFloat(dates[a.order_number].total_amount) : null,
    amount: parseFloat(a.amount) || 0,
  }));
};

const getInvoiceData = async (paymentId) => {
  const payment = await loadPayment(paymentId);
  if (!payment) return null;
  let balances;
  if (payment.balance_before !== null && payment.balance_after !== null) {
    balances = { before: parseFloat(payment.balance_before), after: parseFloat(payment.balance_after) };
  } else {
    balances = await reconstructBalances(payment);
  }
  const [allocations, business] = await Promise.all([loadAllocations(payment), getBusiness()]);
  return { payment, balances, allocations, business };
};

// ---------- Formatting ----------
const inr = (n) =>
  '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '';

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const twoDigits = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`);
const threeDigits = (n) => {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', rest ? twoDigits(rest) : ''].filter(Boolean).join(' ');
};
// Indian numbering: crore, lakh, thousand.
const numberToWords = (num) => {
  let n = Math.floor(num);
  if (n === 0) return 'Zero';
  const parts = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(`${numberToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (n) parts.push(threeDigits(n));
  return parts.join(' ');
};
const amountInWords = (amount) => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  return `Rupees ${numberToWords(rupees)}${paise ? ` and ${twoDigits(paise)} Paise` : ''} Only`;
};

// ---------- PDF ----------
const renderInvoicePdf = ({ payment, balances, allocations, business }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Invoice ${payment.payment_number}`,
        Author: business.businessName,
        Subject: `Payment invoice for ${payment.shop_name || 'customer'}`,
      },
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('Body', path.join(ASSETS, 'PlusJakartaSans-Regular.ttf'));
    doc.registerFont('Medium', path.join(ASSETS, 'PlusJakartaSans-Medium.ttf'));
    doc.registerFont('Semi', path.join(ASSETS, 'PlusJakartaSans-SemiBold.ttf'));
    doc.registerFont('Bold', path.join(ASSETS, 'PlusJakartaSans-Bold.ttf'));
    doc.registerFont('XBold', path.join(ASSETS, 'PlusJakartaSans-ExtraBold.ttf'));
    doc.registerFont('Display', path.join(ASSETS, 'PlayfairDisplay.ttf'));
    doc.registerFont('Brand', path.join(ASSETS, 'Cinzel.ttf'));

    const W = doc.page.width; // 595.28
    const H = doc.page.height; // 841.89
    const M = 40;
    const isTax = !!business.gstin;
    const amount = parseFloat(payment.amount) || 0;
    const cleared = balances.after < PAID_THRESHOLD;

    // ---- Page background ----
    doc.rect(0, 0, W, H).fill(COLORS.ivory);

    // ---- Header band ----
    const headH = 150;
    doc.rect(0, 0, W, headH).fill(COLORS.coal);
    doc.rect(0, 0, W, headH).fillOpacity(0.55).fill(COLORS.coal2).fillOpacity(1);
    // soft gold glow, top right
    const glow = doc.radialGradient(W - 70, 10, 0, W - 70, 10, 260);
    glow.stop(0, COLORS.gold, 0.28).stop(1, COLORS.gold, 0);
    doc.rect(0, 0, W, headH).fill(glow);
    // gold rule under header
    const rule = doc.linearGradient(0, 0, W, 0);
    rule.stop(0, COLORS.goldDark).stop(0.5, COLORS.goldLight).stop(1, COLORS.goldDark);
    doc.rect(0, headH, W, 3).fill(rule);

    // logo in a gold ring
    const lx = M + 34;
    const ly = 72;
    doc.circle(lx, ly, 36).fill(COLORS.gold);
    doc.circle(lx, ly, 34).fill(COLORS.coal);
    doc.save();
    doc.circle(lx, ly, 33).clip();
    doc.image(path.join(ASSETS, 'logo.png'), lx - 33, ly - 33, { width: 66, height: 66 });
    doc.restore();

    doc.fillColor(COLORS.goldLight).font('Brand').fontSize(21)
      .text('BISMILLAH', M + 84, 48, { characterSpacing: 3, lineBreak: false });
    doc.fillColor('#d9cbb4').font('Semi').fontSize(8.5)
      .text('CHICKEN CENTER', M + 85, 76, { characterSpacing: 3.2, lineBreak: false });
    doc.fillColor('#a99d8f').font('Body').fontSize(8)
      .text(business.address || '', M + 85, 92, { width: 220, lineBreak: false, ellipsis: true });

    // title block (right)
    doc.fillColor(COLORS.ivory).font('Display').fontSize(30)
      .text(isTax ? 'Tax Invoice' : 'Invoice', W - M - 250, 40, { width: 250, align: 'right' });
    doc.fillColor(COLORS.goldLight).font('Semi').fontSize(8)
      .text('PAYMENT RECEIPT', W - M - 250, 80, { width: 250, align: 'right', characterSpacing: 2.5 });
    doc.fillColor('#d9cbb4').font('Medium').fontSize(9.5)
      .text(payment.payment_number, W - M - 250, 98, { width: 250, align: 'right' });
    doc.fillColor('#a99d8f').font('Body').fontSize(8.5)
      .text(`${fmtDate(payment.date)}  ·  ${fmtTime(payment.date)}`, W - M - 250, 114, { width: 250, align: 'right' });

    // ---- Meta strip ----
    let y = headH + 22;
    const meta = [
      ['INVOICE NO.', payment.payment_number],
      ['PAYMENT DATE', fmtDate(payment.date)],
      ['METHOD', METHOD_LABELS[payment.method] || payment.method || '—'],
      ['COLLECTED BY', payment.collected_by || '—'],
    ];
    const collectorRole = payment.method === 'online' ? 'Online payment' : payment.collected_by_role === 'driver' ? 'Driver' : 'Office';
    const colW = (W - 2 * M) / meta.length;
    meta.forEach(([label, value], i) => {
      const x = M + i * colW;
      doc.fillColor(COLORS.goldDark).font('Semi').fontSize(7).text(label, x, y, { characterSpacing: 1.4, width: colW - 10 });
      doc.fillColor(COLORS.ink).font('Semi').fontSize(10).text(value, x, y + 12, { width: colW - 10, height: 13, lineBreak: false, ellipsis: true });
      if (i === meta.length - 1) {
        doc.fillColor(COLORS.muted).font('Body').fontSize(7.5).text(collectorRole, x, y + 26, { width: colW - 10 });
      }
    });
    y += 46;
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor(COLORS.line).stroke();

    // ---- From / Billed to ----
    y += 18;
    const boxW = (W - 2 * M - 16) / 2;
    const boxH = 104;
    const drawParty = (x, title, name, lines) => {
      doc.roundedRect(x, y, boxW, boxH, 10).fill(COLORS.cream);
      doc.roundedRect(x, y, boxW, boxH, 10).lineWidth(0.7).strokeColor(COLORS.line).stroke();
      doc.rect(x + 16, y, 34, 2.5).fill(COLORS.gold);
      doc.fillColor(COLORS.goldDark).font('Semi').fontSize(7).text(title, x + 16, y + 14, { characterSpacing: 1.6 });
      doc.fillColor(COLORS.ink).font('Bold').fontSize(12.5).text(name, x + 16, y + 28, { width: boxW - 32, lineBreak: false, ellipsis: true });
      let ly2 = y + 47;
      lines.filter(Boolean).slice(0, 4).forEach((line) => {
        doc.fillColor(COLORS.muted).font('Body').fontSize(8.5).text(line, x + 16, ly2, { width: boxW - 32, lineBreak: false, ellipsis: true });
        ly2 += 13;
      });
    };
    drawParty(M, 'FROM', business.businessName, [
      business.address,
      business.phone ? `Phone: ${business.phone}` : '',
      business.email ? `Email: ${business.email}` : '',
      business.gstin ? `GSTIN: ${business.gstin}` : '',
    ]);
    const place = [payment.retailer_address, payment.area, payment.city, payment.pincode].filter(Boolean).join(', ');
    drawParty(M + boxW + 16, 'BILLED TO', payment.shop_name || 'Customer', [
      payment.owner_name ? `Owner: ${payment.owner_name}` : '',
      place,
      payment.retailer_phone ? `Phone: ${payment.retailer_phone}` : '',
      payment.retailer_email ? `Email: ${payment.retailer_email}` : '',
    ]);
    y += boxH + 22;

    // ---- Balance summary (the three key figures) ----
    const cardGap = 12;
    const cardW = (W - 2 * M - cardGap * 2) / 3;
    const cardH = 92;
    const cards = [
      { label: 'TOTAL BALANCE BEFORE', value: inr(balances.before), note: 'Outstanding before this payment', tone: 'plain' },
      { label: 'PAYMENT RECEIVED', value: inr(amount), note: `Paid by ${METHOD_LABELS[payment.method] || payment.method}`, tone: 'paid' },
      { label: 'BALANCE DUE', value: inr(balances.after), note: cleared ? 'All dues cleared' : 'Remaining to be paid', tone: cleared ? 'clear' : 'due' },
    ];
    cards.forEach((c, i) => {
      const x = M + i * (cardW + cardGap);
      if (c.tone === 'paid') {
        const g = doc.linearGradient(x, y, x + cardW, y + cardH);
        g.stop(0, COLORS.brand).stop(1, COLORS.brandDark);
        doc.roundedRect(x, y, cardW, cardH, 12).fill(g);
        doc.roundedRect(x + 1.5, y + 1.5, cardW - 3, cardH - 3, 11).lineWidth(0.6).strokeColor(COLORS.goldLight).strokeOpacity(0.6).stroke().strokeOpacity(1);
      } else {
        doc.roundedRect(x, y, cardW, cardH, 12).fill(c.tone === 'due' ? COLORS.brandSoft : c.tone === 'clear' ? COLORS.successSoft : COLORS.goldSoft);
        doc.roundedRect(x, y, cardW, cardH, 12).lineWidth(0.7)
          .strokeColor(c.tone === 'due' ? '#efc9c6' : c.tone === 'clear' ? '#bfe0cc' : '#ecd9ae').stroke();
      }
      const light = c.tone === 'paid';
      const valueColor = light ? COLORS.ivory : c.tone === 'due' ? COLORS.brand : c.tone === 'clear' ? COLORS.success : COLORS.ink;
      doc.fillColor(light ? COLORS.goldLight : COLORS.goldDark).font('Semi').fontSize(7)
        .text(c.label, x + 16, y + 16, { characterSpacing: 1.3, width: cardW - 32 });
      let size = 19;
      doc.font('XBold').fontSize(size);
      while (doc.widthOfString(c.value) > cardW - 32 && size > 11) doc.fontSize(--size);
      doc.fillColor(valueColor).text(c.value, x + 16, y + 34, { width: cardW - 32, lineBreak: false });
      doc.fillColor(light ? '#f3d9d6' : COLORS.muted).font('Body').fontSize(8)
        .text(c.note, x + 16, y + 66, { width: cardW - 32, lineBreak: false, ellipsis: true });
    });
    y += cardH + 14;

    // equation line: before − paid = due
    doc.fillColor(COLORS.muted).font('Medium').fontSize(8.5)
      .text(`${inr(balances.before)}  −  ${inr(amount)}  =  ${inr(balances.after)}`, M, y, { width: W - 2 * M, align: 'center' });
    y += 26;

    // ---- Applied to bills ----
    doc.fillColor(COLORS.ink).font('Display').fontSize(15).text('Payment details', M, y);
    y += 24;
    const cols = [
      { key: 'label', title: 'BILL / ACCOUNT', w: 0.36, align: 'left' },
      { key: 'date', title: 'BILL DATE', w: 0.2, align: 'left' },
      { key: 'billTotal', title: 'BILL TOTAL', w: 0.22, align: 'right' },
      { key: 'amount', title: 'AMOUNT APPLIED', w: 0.22, align: 'right' },
    ];
    const tW = W - 2 * M;
    const rowH = 26;
    doc.roundedRect(M, y, tW, rowH, 6).fill(COLORS.coal);
    let cx = M + 14;
    cols.forEach((c) => {
      const w = c.w * (tW - 28);
      doc.fillColor(COLORS.goldLight).font('Semi').fontSize(7.2)
        .text(c.title, cx, y + 9.5, { width: w, align: c.align, characterSpacing: 1.1 });
      cx += w;
    });
    y += rowH;
    const rows = allocations.length
      ? allocations
      : [{ label: 'Payment on account', date: null, billTotal: null, amount }];
    const maxRows = 9;
    rows.slice(0, maxRows).forEach((r, i) => {
      if (i % 2 === 1) doc.rect(M, y, tW, rowH).fill(COLORS.cream);
      let x2 = M + 14;
      const values = {
        label: r.label,
        date: r.date ? fmtDate(r.date) : '—',
        billTotal: r.billTotal !== null && r.billTotal !== undefined ? inr(r.billTotal) : '—',
        amount: inr(r.amount),
      };
      cols.forEach((c) => {
        const w = c.w * (tW - 28);
        doc.fillColor(c.key === 'amount' ? COLORS.ink : COLORS.ink)
          .font(c.key === 'amount' || c.key === 'label' ? 'Semi' : 'Body').fontSize(9)
          .text(values[c.key], x2, y + 8.5, { width: w, align: c.align, lineBreak: false, ellipsis: true });
        x2 += w;
      });
      y += rowH;
    });
    if (rows.length > maxRows) {
      doc.fillColor(COLORS.muted).font('Body').fontSize(8)
        .text(`+ ${rows.length - maxRows} more bills`, M + 14, y + 6);
      y += 20;
    }
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor(COLORS.line).stroke();
    y += 10;

    // total row
    doc.fillColor(COLORS.muted).font('Semi').fontSize(8).text('TOTAL PAID', M + tW * 0.5, y + 6, { width: tW * 0.25, align: 'right', characterSpacing: 1.2 });
    doc.fillColor(COLORS.brand).font('XBold').fontSize(14).text(inr(amount), M + tW * 0.75, y + 2, { width: tW * 0.25 - 14, align: 'right' });
    y += 30;

    // amount in words
    doc.roundedRect(M, y, tW, 34, 8).fill(COLORS.goldSoft);
    doc.fillColor(COLORS.goldDark).font('Semi').fontSize(7).text('AMOUNT IN WORDS', M + 14, y + 8, { characterSpacing: 1.3 });
    doc.fillColor(COLORS.ink).font('Medium').fontSize(9).text(amountInWords(amount), M + 14, y + 18, { width: tW - 28, lineBreak: false, ellipsis: true });
    y += 46;

    if (payment.notes) {
      doc.fillColor(COLORS.goldDark).font('Semi').fontSize(7).text('NOTES', M, y, { characterSpacing: 1.3 });
      doc.fillColor(COLORS.muted).font('Body').fontSize(8.5).text(payment.notes, M, y + 11, { width: tW * 0.62, height: 36, ellipsis: true });
    }

    // ---- PAID stamp ----
    doc.save();
    doc.rotate(-12, { origin: [W - M - 70, y + 18] });
    doc.roundedRect(W - M - 130, y, 120, 40, 8).lineWidth(2).strokeColor(COLORS.success).strokeOpacity(0.85).stroke();
    doc.fillColor(COLORS.success).fillOpacity(0.9).font('XBold').fontSize(20)
      .text('PAID', W - M - 130, y + 9, { width: 120, align: 'center', characterSpacing: 4 });
    doc.restore();
    doc.fillOpacity(1).strokeOpacity(1);

    // ---- Footer ----
    const fy = H - 92;
    doc.rect(0, fy - 1, W, 1).fill(COLORS.line);
    doc.fillColor(COLORS.ink).font('Display').fontSize(13)
      .text('Thank you for your business!', M, fy + 16, { width: tW / 2 });
    doc.fillColor(COLORS.muted).font('Body').fontSize(7.8)
      .text('This is a computer-generated invoice and does not need a signature.', M, fy + 36, { width: tW / 2 + 40 });
    const contact = [business.phone, business.email].filter(Boolean).join('  ·  ');
    doc.fillColor(COLORS.muted).font('Body').fontSize(7.8)
      .text(contact, W / 2, fy + 18, { width: tW / 2, align: 'right' });
    doc.fillColor(COLORS.muted).font('Body').fontSize(7.8)
      .text('bismillahchickencenter.com', W / 2, fy + 31, { width: tW / 2, align: 'right' });

    // bottom band
    doc.rect(0, H - 26, W, 26).fill(COLORS.coal);
    doc.rect(0, H - 26, W, 1.5).fill(rule);
    doc.fillColor('#a99d8f').font('Body').fontSize(7)
      .text('Designed by ', M, H - 16.5, { continued: true })
      .fillColor(COLORS.goldLight).font('Semi').text('Nirmaan Digital', { continued: true, link: 'https://nirmaandigital.com' })
      .fillColor('#a99d8f').font('Body').text('  ·  nirmaandigital.com', { link: 'https://nirmaandigital.com' });
    doc.fillColor('#a99d8f').font('Body').fontSize(7)
      .text(`${business.businessName}  ·  ${payment.payment_number}`, W / 2, H - 16.5, { width: tW / 2, align: 'right', lineBreak: false });

    doc.end();
  });

const invoiceFileName = (payment) =>
  `Invoice-${payment.payment_number}-${(payment.shop_name || 'customer').replace(/[^a-z0-9]+/gi, '-')}.pdf`
    .replace(/-+/g, '-');

module.exports = {
  ensureInvoiceColumns,
  syncAllOutstanding,
  snapshotBalance,
  getBusiness,
  saveBusiness,
  canAccess,
  createDownloadToken,
  verifyDownloadToken,
  getInvoiceData,
  renderInvoicePdf,
  invoiceFileName,
  amountInWords,
};
