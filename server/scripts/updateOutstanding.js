const pool = require('../config/db');
require('dotenv').config();

const updateOutstanding = async () => {
  try {
    console.log('🔄 Updating outstanding balances...');
    console.log('=================================');

    // Check current values first
    console.log('📊 Current outstanding values:');
    const [before] = await pool.query(`
      SELECT id, shop_name, outstanding FROM retailers
    `);
    console.table(before);

    // Update outstanding
    const [result] = await pool.query(`
      UPDATE retailers r
      SET r.outstanding = (
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM orders o
        WHERE o.retailer_id = r.id
        AND o.order_status != 'cancelled'
      ) - (
        SELECT COALESCE(SUM(o.paid_amount), 0)
        FROM orders o
        WHERE o.retailer_id = r.id
      )
    `);

    console.log(`\n✅ Outstanding updated for ${result.affectedRows} retailers`);

    // Verify the update
    console.log('\n📊 Updated outstanding values:');
    const [after] = await pool.query(`
      SELECT 
        r.id,
        r.shop_name,
        r.outstanding,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_amount,
        COALESCE(SUM(o.paid_amount), 0) as total_paid
      FROM retailers r
      LEFT JOIN orders o ON r.id = o.retailer_id
      GROUP BY r.id
    `);
    console.table(after);

    console.log('\n🎉 Outstanding update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating outstanding:', error.message);
    console.error('❌ Details:', error);
    process.exit(1);
  }
};

updateOutstanding();