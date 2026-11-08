const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const audit = require('../services/auditService');

// Login user (phone number, or email for accounts that have one).
// Every attempt is written to the activity log with its IP address.
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Validate input
    if (!phone || !password || typeof phone !== 'string' || typeof password !== 'string' || password.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required'
      });
    }

    const identifier = phone.trim().slice(0, 120);
    const byEmail = identifier.includes('@');
    const failed = (reason, user) =>
      audit.record(req, {
        actor: user ? { id: user.id, name: user.name, role: user.role } : { name: identifier },
        action: 'Sign-in failed',
        category: 'login',
        success: false,
        statusCode: 401,
        summary: `${reason} (${identifier})`,
      });
    
    // Find user by phone or email
    const [users] = await pool.query(
      byEmail ? 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)' : 'SELECT * FROM users WHERE phone = ?',
      [identifier]
    );
    
    if (users.length === 0) {
      failed('Unknown account');
      return res.status(401).json({
        success: false,
        message: byEmail ? 'Invalid email or password' : 'Invalid phone number or password'
      });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (user.status !== 'active') {
      failed('Account is inactive', user);
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact administrator.'
      });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      failed('Wrong password', user);
      return res.status(401).json({
        success: false,
        message: byEmail ? 'Invalid email or password' : 'Invalid phone number or password'
      });
    }
    
    // Update last login
    const ip = audit.clientIp(req);
    try {
      await pool.query('UPDATE users SET last_login = NOW(), last_login_ip = ? WHERE id = ?', [ip, user.id]);
    } catch {
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    }
    audit.record(req, {
      actor: { id: user.id, name: user.name, role: user.role },
      action: 'Signed in',
      category: 'login',
      statusCode: 200,
      summary: byEmail ? `With email ${identifier}` : `With phone ${identifier}`,
    });
    
    // Generate JWT token (secret comes from config/jwt.js, which refuses to
    // start without a real JWT_SECRET)
    const token = jwt.sign(
      { 
        id: user.id, 
        phone: user.phone, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    console.log(`✅ User logged in: ${user.name} (${user.role})`);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query(
      'SELECT id, name, phone, email, role, status, last_login FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('❌ Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user info',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getCurrentUser
};