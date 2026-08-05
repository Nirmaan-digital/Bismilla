const pool = require('../config/db');

// Get current pricing
const getCurrentPricing = async (req, res) => {
  try {
    console.log('📊 Fetching current pricing...');
    
    const [pricing] = await pool.query(`
      SELECT 
        id, 
        default_price_per_kg as price_per_kg, 
        updated_by, 
        updated_at
      FROM pricing
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    
    if (pricing.length === 0) {
      // Return default pricing if none exists
      return res.status(200).json({
        success: true,
        data: { 
          price_per_kg: 188,
          updated_by: 'System',
          updated_at: new Date()
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: pricing[0]
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing',
      error: error.message
    });
  }
};

// Update pricing (admin only)
const updatePricing = async (req, res) => {
  try {
    const { price_per_kg } = req.body;
    const userId = req.user?.id || 'System';
    
    if (!price_per_kg || price_per_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price per kg is required'
      });
    }
    
    // Get user name for updated_by
    let updatedBy = 'System';
    if (req.user && req.user.id) {
      const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      if (user.length > 0) {
        updatedBy = user[0].name;
      }
    }
    
    // Insert new pricing record
    const [result] = await pool.query(`
      INSERT INTO pricing (default_price_per_kg, updated_by)
      VALUES (?, ?)
    `, [price_per_kg, updatedBy]);
    
    const [newPricing] = await pool.query(`
      SELECT 
        id, 
        default_price_per_kg as price_per_kg, 
        updated_by, 
        updated_at
      FROM pricing
      WHERE id = ?
    `, [result.insertId]);
    
    res.status(200).json({
      success: true,
      message: 'Pricing updated successfully',
      data: newPricing[0]
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing',
      error: error.message
    });
  }
};

module.exports = {
  getCurrentPricing,
  updatePricing
};