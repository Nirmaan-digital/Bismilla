const pool = require('../config/db');

// ============================================
// CREATE ORDER
// ============================================
const createOrder = async (req, res) => {
    let connection;
    try {
        console.log('=================================');
        console.log('📝 CREATE ORDER API CALLED');
        console.log('=================================');
        
        const userId = req.user.id;
        console.log('👤 User ID from JWT:', userId);
        
        const {
            kg_ordered,
            rate_per_kg,
            delivery_charge = 0,
            discount = 0,
            payment_method = 'pending',
            delivery_address = null,
            notes = null,
            order_date = new Date()
        } = req.body;
        
        console.log('📦 Order Data Received:', {
            kg_ordered,
            rate_per_kg,
            delivery_charge,
            discount,
            payment_method,
            delivery_address,
            notes,
            order_date
        });

        // VALIDATION
        if (!kg_ordered || kg_ordered <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid quantity (kg_ordered > 0)'
            });
        }

        if (!rate_per_kg || rate_per_kg <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid rate per kg'
            });
        }

        // GET RETAILER ID
        console.log('🔍 Looking up retailer for user:', userId);
        const [retailer] = await pool.query(
            'SELECT id FROM retailers WHERE user_id = ?',
            [userId]
        );

        if (retailer.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Retailer profile not found. Please contact admin.'
            });
        }

        const retailerId = retailer[0].id;
        console.log('✅ Retailer ID found:', retailerId);

        // CALCULATE FINANCIALS
        const subtotal = parseFloat(kg_ordered) * parseFloat(rate_per_kg);
        const total_amount = subtotal + parseFloat(delivery_charge) - parseFloat(discount);
        const paid_amount = 0;
        const balance = total_amount;
        
        console.log('💰 Financials Calculated:', {
            subtotal,
            total_amount,
            paid_amount,
            balance
        });

        // GENERATE ORDER NUMBER
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
        );
        const orderCount = countResult[0].count + 1;
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
        const order_number = `BIS-${dateStr}-${String(orderCount).padStart(4, '0')}`;
        console.log('📋 Order Number Generated:', order_number);

        // GET CONNECTION FOR TRANSACTION
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // INSERT ORDER
        console.log('💾 Inserting order into database...');

        const [result] = await connection.query(
            `INSERT INTO orders (
                order_number,
                retailer_id,
                kg_ordered,
                rate_per_kg,
                subtotal,
                discount,
                delivery_charge,
                total_amount,
                paid_amount,
                balance,
                payment_method,
                payment_status,
                order_status,
                delivery_address,
                notes,
                order_date,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                order_number,
                retailerId,
                kg_ordered,
                rate_per_kg,
                subtotal,
                discount,
                delivery_charge,
                total_amount,
                paid_amount,
                balance,
                payment_method,
                'pending',
                'pending',
                delivery_address,
                notes,
                order_date
            ]
        );

        console.log('✅ Order inserted with ID:', result.insertId);

        await connection.commit();

        // GET THE CREATED ORDER
        const [newOrder] = await pool.query(`
            SELECT 
                o.*,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
            WHERE o.id = ?
        `, [result.insertId]);

        console.log('✅ Order created successfully:', order_number);
        console.log('=================================');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: newOrder[0]
        });

    } catch (error) {
        console.error('❌ ERROR in createOrder:', error);
        console.error('❌ Error Message:', error.message);
        console.log('=================================');
        
        if (connection) {
            try {
                await connection.rollback();
                console.log('🔄 Transaction rolled back');
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            try {
                connection.release();
                console.log('🔌 Connection released');
            } catch (releaseError) {
                console.error('❌ Release failed:', releaseError);
            }
        }
    }
};

// ============================================
// GET MY ORDERS (Retailer) ✅ READS FROM trip_orders
// ============================================
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📋 Fetching orders for user:', userId);

        const [retailer] = await pool.query(
            'SELECT id FROM retailers WHERE user_id = ?',
            [userId]
        );

        if (retailer.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Retailer profile not found'
            });
        }

        // ✅ COMPLETE QUERY: Pull delivered_status directly from trip_orders
        const [orders] = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.kg_ordered,
                o.rate_per_kg,
                o.total_amount,
                o.paid_amount,
                o.balance,
                o.payment_method,
                o.payment_status,
                o.order_status as original_order_status, -- Keep original for fallback
                o.delivery_address,
                o.order_date,
                o.created_at,
                o.delivered_date,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone,
                -- Pull actual delivered stats
                COALESCE(to_.actual_delivered_kg, 
                    CASE WHEN o.order_status = 'delivered' THEN o.kg_ordered ELSE 0 END
                ) as kg_delivered,
                COALESCE(to_.cash_collected, 0) as cash_collected,
                t.trip_number,
                -- 🟢 CRITICAL CHANGE: Read this for the Green Badge!
                to_.delivered_status
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
            LEFT JOIN trip_orders to_ ON o.id = to_.order_id
            LEFT JOIN trips t ON o.trip_id = t.id
            WHERE o.retailer_id = ?
            ORDER BY o.created_at DESC
        `, [retailer[0].id]);

        // Map data to frontend expectations (Prioritize trip_orders delivered_status)
        const formattedOrders = orders.map(order => ({
            ...order,
            // If trip_orders says delivered, override main orders status!
            order_status: order.delivered_status === 'delivered' 
                ? 'delivered' 
                : order.original_order_status
        }));

        console.log(`✅ Found ${formattedOrders.length} orders mapped from trip_orders`);

        res.status(200).json({
            success: true,
            data: formattedOrders,
            count: formattedOrders.length
        });

    } catch (error) {
        console.error('❌ Error in getMyOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// GET ALL ORDERS (Admin) ✅ READS FROM trip_orders
// ============================================
const getAllOrders = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        console.log('📋 Fetching orders...');

        const { retailer_id } = req.query;

        let sqlQuery = `
            SELECT 
                o.id,
                o.order_number,
                o.kg_ordered,
                o.rate_per_kg,
                o.total_amount,
                o.paid_amount,
                o.balance,
                o.payment_method,
                o.payment_status,
                o.order_status as original_order_status,
                o.delivery_address,
                o.order_date,
                o.created_at,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone,
                COALESCE(to_.actual_delivered_kg, 
                    CASE WHEN o.order_status = 'delivered' THEN o.kg_ordered ELSE 0 END
                ) as kg_delivered,
                COALESCE(to_.cash_collected, 0) as cash_collected,
                t.trip_number,
                to_.delivered_status
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
            LEFT JOIN trip_orders to_ ON o.id = to_.order_id
            LEFT JOIN trips t ON o.trip_id = t.id
        `;
        
        let queryParams = [];

        if (retailer_id) {
            sqlQuery += ` WHERE o.retailer_id = ?`;
            queryParams.push(retailer_id);
        }

        sqlQuery += ` ORDER BY o.created_at DESC`;

        const [orders] = await pool.query(sqlQuery, queryParams);

        const formattedOrders = orders.map(order => ({
            ...order,
            order_status: order.delivered_status === 'delivered' 
                ? 'delivered' 
                : order.original_order_status
        }));

        console.log(`✅ Found ${formattedOrders.length} orders mapped from trip_orders`);

        res.status(200).json({
            success: true,
            data: formattedOrders,
            count: formattedOrders.length
        });

    } catch (error) {
        console.error('❌ Error in getAllOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

// ============================================
// GET ORDER BY ID (Single order details) ✅ FINAL FIX
// ============================================
const getOrderById = async (req, res) => {
    try {
        // ✅ Frontend now passes the numeric Primary Key ID
        const { id } = req.params; 
        const userId = req.user.id;
        const userRole = req.user.role;

        // ✅ CRITICAL FIX: Include o.retailer_id in the SELECT clause!
        const [orders] = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.retailer_id,  -- 🟢 THIS WAS MISSING! Without this, undefined happens.
                o.kg_ordered,
                o.rate_per_kg,
                o.total_amount,
                o.paid_amount,
                o.balance,
                o.payment_method,
                o.payment_status,
                o.order_status as original_order_status,
                o.delivery_address,
                o.order_date,
                o.created_at,
                o.delivered_date,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone,
                COALESCE(to_.actual_delivered_kg, 
                    CASE WHEN o.order_status = 'delivered' THEN o.kg_ordered ELSE 0 END
                ) as kg_delivered,
                COALESCE(to_.cash_collected, 0) as cash_collected,
                t.trip_number,
                to_.delivered_status
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
            LEFT JOIN trip_orders to_ ON o.id = to_.order_id
            LEFT JOIN trips t ON o.trip_id = t.id
            WHERE o.id = ? 
        `, [id]); // ✅ Searching by Numeric Primary ID

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orders[0];
        
        // Override status based on trip_orders
        order.order_status = order.delivered_status === 'delivered' 
            ? 'delivered' 
            : order.original_order_status;

        // 🔒 Security Check: Make sure the logged-in user owns this order
        if (userRole !== 'admin') {
            // Find the retailer profile of the logged-in user
            const [retailer] = await pool.query(
                'SELECT id FROM retailers WHERE user_id = ?',
                [userId]
            );

            // 🛡️ FINAL FIX: Compare using Number() 
            if (retailer.length === 0 || Number(order.retailer_id) !== Number(retailer[0].id)) {
                console.warn(`🚫 Access Denied! Order ID ${id} belongs to retailer ${order.retailer_id}, but user is linked to retailer ${retailer[0]?.id}`);
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. This is not your order.'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('❌ Error in getOrderById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

// ============================================
// UPDATE ORDER STATUS (Admin)
// ============================================
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        console.log(`🔄 Updating order ${id} status to ${status}`);

        const [orderExists] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [id]
        );

        if (orderExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await pool.query(
            `UPDATE orders 
             SET order_status = ?, 
                 updated_at = NOW()
             WHERE id = ?`,
            [status, id]
        );

        const [updatedOrder] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: updatedOrder[0]
        });

    } catch (error) {
        console.error('❌ Error in updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

// ============================================
// GET ORDER STATS FOR RETAILER
// ============================================
const getOrderStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [retailer] = await pool.query(
            'SELECT id FROM retailers WHERE user_id = ?',
            [userId]
        );

        if (retailer.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Retailer profile not found'
            });
        }

        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN order_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN order_status = 'out_for_delivery' THEN 1 ELSE 0 END) as out_for_delivery_orders,
                SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(total_amount) as total_amount,
                SUM(paid_amount) as total_paid,
                SUM(balance) as total_balance,
                AVG(kg_ordered) as avg_kg_ordered,
                SUM(kg_ordered) as total_kg_ordered
            FROM orders
            WHERE retailer_id = ?
        `, [retailer[0].id]);

        res.status(200).json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('❌ Error in getOrderStats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order statistics'
        });
    }
};

// ============================================
// NEW: RECORD A PAYMENT (Admin only)
// ============================================
const recordPayment = async (req, res) => {
    let connection;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { 
            retailer_id, 
            amount, 
            payment_method, 
            bill_allocations 
        } = req.body;

        if (!retailer_id || !amount || amount <= 0 || !bill_allocations || bill_allocations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment data.'
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [retailerRows] = await connection.query(
            'SELECT outstanding FROM retailers WHERE id = ?',
            [retailer_id]
        );
        
        if (retailerRows.length === 0) throw new Error('Retailer not found');

        const currentOutstanding = parseFloat(retailerRows[0].outstanding) || 0;
        const newOutstanding = Math.max(0, currentOutstanding - amount);

        let processedAmount = 0;
        let lastUpdatedOrderId = null;
        
        for (const alloc of bill_allocations) {
            if (!alloc.bill_id || alloc.amount_paid <= 0) continue;

            const [orderRows] = await connection.query(
                'SELECT id, balance, paid_amount FROM orders WHERE order_number = ? AND retailer_id = ?',
                [alloc.bill_id, retailer_id]
            );

            if (orderRows.length === 0) continue;

            const order = orderRows[0];
            const currentBillBalance = parseFloat(order.balance) || 0;
            const payAmount = Math.min(alloc.amount_paid, currentBillBalance);

            if (payAmount > 0) {
                await connection.query(
                    `UPDATE orders SET balance = balance - ?, paid_amount = paid_amount + ? WHERE id = ?`,
                    [payAmount, payAmount, order.id]
                );
                
                lastUpdatedOrderId = order.id; 
                processedAmount += payAmount;
            }
        }

        await connection.query(
            'UPDATE retailers SET outstanding = ? WHERE id = ?',
            [newOutstanding, retailer_id]
        );

        const description = `Payment via ${payment_method}`;
        const currentDate = new Date().toISOString().slice(0, 10);

        await connection.query(
            `INSERT INTO ledgers (retailer_id, order_id, type, amount, description, date, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [retailer_id, lastUpdatedOrderId, 'credit', amount, description, currentDate]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully',
            data: { newOutstanding, processedAmount }
        });

    } catch (error) {
        await connection.rollback();
        console.error('❌ Error in recordPayment:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to record payment' });
    } finally {
        connection.release();
    }
};

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================
module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats,
    recordPayment
};