const pool = require('../config/db');

// ============================================
// 1. GET: Public Current Pricing
// ============================================
exports.getCurrentPricing = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT default_price_per_kg FROM pricing ORDER BY id DESC LIMIT 1');
        const price = rows[0]?.default_price_per_kg || 188; // Default fallback if table is empty
        res.json({ success: true, price });
    } catch (error) {
        console.error('Error fetching current pricing:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============================================
// 2. GET: Admin Pricing Data (Global + All Retailers + Custom)
// ============================================
exports.getAdminPricingData = async (req, res) => {
    try {
        // 1. Get the latest Global Price
        const [globalRows] = await pool.query('SELECT default_price_per_kg, updated_at FROM pricing ORDER BY id DESC LIMIT 1');
        const globalPrice = globalRows[0] || { default_price_per_kg: 188 };

        // 2. Get all retailers and join with their custom prices (if they exist)
        const [retailers] = await pool.query(`
            SELECT 
                r.id, 
                r.shop_name, 
                r.owner_name, 
                r.phone,
                COALESCE(rp.custom_price_per_kg, 0) as custom_price,
                rp.updated_at as custom_price_updated_at
            FROM retailers r
            LEFT JOIN retailer_pricing rp ON r.id = rp.retailer_id
            ORDER BY r.shop_name ASC
        `);

        res.json({
            success: true,
            globalPrice: globalPrice.default_price_per_kg,
            lastUpdated: globalPrice.updated_at,
            retailers: retailers
        });

    } catch (error) {
        console.error('Error in getAdminPricingData:', error);
        res.status(500).json({ success: false, message: 'Server error fetching pricing data' });
    }
};

// ============================================
// 3. POST: Update Global Price (Admin)
// ============================================
exports.updateGlobalPrice = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
        }

        const { price } = req.body;
        if (!price || price <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid price provided' });
        }

        // Insert a new row into pricing table
        await pool.query(
            'INSERT INTO pricing (default_price_per_kg, updated_by) VALUES (?, ?)',
            [price, req.user.name || 'Admin']
        );

        res.json({ success: true, message: 'Global price updated successfully!' });

    } catch (error) {
        console.error('Error updating global price:', error);
        res.status(500).json({ success: false, message: 'Failed to update global price' });
    }
};

// ============================================
// 4. POST: Update Custom Price for Retailer
// ============================================
exports.updateCustomPrice = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
        }

        const { retailer_id, custom_price } = req.body;
        if (!retailer_id || !custom_price || custom_price <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }

        // Check if a custom price already exists for this retailer
        const [existing] = await pool.query(
            'SELECT id FROM retailer_pricing WHERE retailer_id = ?',
            [retailer_id]
        );

        if (existing.length > 0) {
            // Update existing
            await pool.query(
                'UPDATE retailer_pricing SET custom_price_per_kg = ?, updated_by = ?, updated_at = NOW() WHERE retailer_id = ?',
                [custom_price, req.user.name || 'Admin', retailer_id]
            );
        } else {
            // Insert new
            await pool.query(
                'INSERT INTO retailer_pricing (retailer_id, custom_price_per_kg, updated_by) VALUES (?, ?, ?)',
                [retailer_id, custom_price, req.user.name || 'Admin']
            );
        }

        res.json({ success: true, message: 'Custom price updated successfully!' });

    } catch (error) {
        console.error('Error updating custom price:', error);
        res.status(500).json({ success: false, message: 'Failed to update custom price' });
    }
};

// ============================================
// 5. DELETE: Revert Custom Price to Default
// ============================================
exports.deleteCustomPrice = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
        }

        const { retailerId } = req.params;
        await pool.query('DELETE FROM retailer_pricing WHERE retailer_id = ?', [retailerId]);

        res.json({ success: true, message: 'Reverted to global default price.' });

    } catch (error) {
        console.error('Error deleting custom price:', error);
        res.status(500).json({ success: false, message: 'Failed to revert custom price' });
    }
};

// ============================================
// 6. GET: Specific Price for Logged-in Retailer
// ============================================
exports.getRetailerPrice = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get the retailer ID associated with this user
        const [retailer] = await pool.query('SELECT id FROM retailers WHERE user_id = ?', [userId]);
        if (retailer.length === 0) {
            return res.status(404).json({ success: false, message: 'Retailer profile not found' });
        }
        const retailerId = retailer[0].id;

        // 2. Get latest global price
        const [globalRow] = await pool.query('SELECT default_price_per_kg FROM pricing ORDER BY id DESC LIMIT 1');
        const globalPrice = globalRow[0]?.default_price_per_kg || 188;

        // 3. Check if this specific retailer has a custom price
        const [customRow] = await pool.query(
            'SELECT custom_price_per_kg FROM retailer_pricing WHERE retailer_id = ?',
            [retailerId]
        );

        // 4. Return either custom or global
        const finalPrice = customRow.length > 0 ? parseFloat(customRow[0].custom_price_per_kg) : parseFloat(globalPrice);

        res.json({
            success: true,
            price: finalPrice,
            isCustom: customRow.length > 0
        });

    } catch (error) {
        console.error('Error fetching retailer price:', error);
        res.status(500).json({ success: false, message: 'Server error fetching price' });
    }
};