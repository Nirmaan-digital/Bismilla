const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Get all retailers
const getAllRetailers = async (req, res) => {
  try {
    const [retailers] = await pool.query(`
      SELECT r.*, u.phone, u.status as user_status 
      FROM retailers r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, retailers });
  } catch (error) {
    console.error('Get retailers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create retailer
const createRetailer = async (req, res) => {
  try {
    const { 
      owner_name, shop_name, phone, password, email, 
      address, area, city, pincode, credit_limit, status 
    } = req.body;

    if (!owner_name || !shop_name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, shop name, phone, and password are required'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [userResult] = await connection.query(
        `INSERT INTO users (name, phone, password, role, status) 
         VALUES (?, ?, ?, 'retailer', ?)`,
        [owner_name, phone, hashedPassword, status || 'active']
      );

      const userId = userResult.insertId;

      const [retailerResult] = await connection.query(
        `INSERT INTO retailers (
          user_id, owner_name, shop_name, phone, email, 
          address, area, city, pincode, credit_limit, status, joined_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
          userId, owner_name, shop_name, phone, email || null,
          address || null, area || null, city || null, pincode || null,
          credit_limit || 0, status || 'active'
        ]
      );

      await connection.commit();

      const [newRetailer] = await connection.query(`
        SELECT r.*, u.phone, u.status as user_status 
        FROM retailers r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.id = ?
      `, [retailerResult.insertId]);

      res.status(201).json({
        success: true,
        message: 'Retailer created successfully',
        retailer: newRetailer[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create retailer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllRetailers,
  createRetailer
};