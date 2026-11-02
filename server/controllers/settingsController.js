const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const invoiceService = require('../services/invoiceService');

// ============================================
// 1. GET BUSINESS SETTINGS
// Shown on every payment invoice (name, address, phone, email, GSTIN).
// ============================================
exports.getBusinessSettings = async (req, res) => {
    try {
        const data = await invoiceService.getBusiness();
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching business settings:', error);
        res.status(500).json({ success: false, message: 'Failed to load business settings' });
    }
};

// ============================================
// 2. UPDATE BUSINESS SETTINGS
// ============================================
exports.updateBusinessSettings = async (req, res) => {
    try {
        const { gstin } = req.body;
        const cleanGstin = typeof gstin === 'string' ? gstin.toUpperCase().replace(/\s+/g, '') : '';
        // GSTIN format: 2-digit state code, PAN, entity number, Z, checksum.
        if (cleanGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(cleanGstin)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid 15-character GSTIN.' });
        }
        const data = await invoiceService.saveBusiness(req.body || {});
        res.json({ success: true, message: 'Business settings updated successfully!', data });
    } catch (error) {
        console.error('Error updating business settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update business settings' });
    }
};

// ============================================
// 3. GET ACCOUNT SETTINGS (Admin Profile)
// ============================================
exports.getAccountSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.query(
            'SELECT id, name, phone, email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Error fetching account settings:', error);
        res.status(500).json({ success: false, message: 'Failed to load account settings' });
    }
};

// ============================================
// 4. UPDATE ACCOUNT SETTINGS (Admin Profile)
// ============================================
exports.updateAccountSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        await pool.query(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [name, phone, userId]
        );

        res.json({ success: true, message: 'Account updated successfully!' });
    } catch (error) {
        console.error('Error updating account settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update account settings' });
    }
};

// ============================================
// 5. CHANGE PASSWORD
// ============================================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // 1. Get the user's current hashed password from DB
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Compare current password
        const isValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // 3. Hash the new password and save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ success: true, message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};