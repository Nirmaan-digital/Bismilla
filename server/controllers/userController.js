const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, phone, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const { name, phone, password, role, status } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, password, and role are required'
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, phone, password, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, phone, hashedPassword, role, status || 'active']
    );

    const [newUser] = await pool.query(
      'SELECT id, name, phone, role, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle user status
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (id == req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    const [user] = await pool.query(
      'SELECT status FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = user[0].status === 'active' ? 'inactive' : 'active';

    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      status: newStatus
    });

  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  toggleStatus
};