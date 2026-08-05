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

        // INSERT ORDER - With all columns now available
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
// GET MY ORDERS
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

        const [orders] = await pool.query(`
            SELECT 
                o.*,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
            WHERE o.retailer_id = ?
            ORDER BY o.created_at DESC
        `, [retailer[0].id]);

        console.log(`✅ Found ${orders.length} orders`);

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length
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
// GET ALL ORDERS (Admin) 🔥 UPDATED TO FILTER BY RETAILER
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

        // 🔥 NEW: Check if a specific retailer_id was sent in the query params
        const { retailer_id } = req.query;

        let sqlQuery = `
            SELECT 
                o.*,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
        `;
        
        let queryParams = [];

        // If a retailer_id is passed, filter ONLY for that retailer
        if (retailer_id) {
            sqlQuery += ` WHERE o.retailer_id = ?`;
            queryParams.push(retailer_id);
        }

        sqlQuery += ` ORDER BY o.created_at DESC`;

        const [orders] = await pool.query(sqlQuery, queryParams);

        console.log(`✅ Found ${orders.length} orders`);

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length
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
// GET ORDER BY ID
// ============================================
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const [orders] = await pool.query(`
            SELECT 
                o.*,
                r.shop_name,
                r.owner_name,
                r.phone as retailer_phone
            FROM orders o
            JOIN retailers r ON o.retailer_id = r.id
            WHERE o.id = ?
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orders[0];

        if (userRole !== 'admin') {
            const [retailer] = await pool.query(
                'SELECT id FROM retailers WHERE user_id = ?',
                [userId]
            );

            if (retailer.length === 0 || order.retailer_id !== retailer[0].id) {
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
        // Admin check (Optional: Remove if you want retailers to record payments too)
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

        // 1. Validate Input
        if (!retailer_id || !amount || amount <= 0 || !bill_allocations || bill_allocations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment data. Amount and bill allocations are required.'
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 2. Get current retailer outstanding balance
        const [retailerRows] = await connection.query(
            'SELECT outstanding FROM retailers WHERE id = ?',
            [retailer_id]
        );
        
        if (retailerRows.length === 0) {
            throw new Error('Retailer not found');
        }

        const currentOutstanding = parseFloat(retailerRows[0].outstanding) || 0;
        const newOutstanding = Math.max(0, currentOutstanding - amount);

        // 3. Update specific bill balances (FIFO)
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
                    `UPDATE orders 
                     SET balance = balance - ?, 
                         paid_amount = paid_amount + ? 
                     WHERE id = ?`,
                    [payAmount, payAmount, order.id]
                );
                
                lastUpdatedOrderId = order.id; 
                processedAmount += payAmount;
            }
        }

        // 4. Update retailer total outstanding
        await connection.query(
            'UPDATE retailers SET outstanding = ? WHERE id = ?',
            [newOutstanding, retailer_id]
        );

        // 5. Insert into ledgers table
        const description = `Payment via ${payment_method}`;
        const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        await connection.query(
            `INSERT INTO ledgers 
             (retailer_id, order_id, type, amount, description, date, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [retailer_id, lastUpdatedOrderId, 'credit', amount, description, currentDate]
        );

        // 6. Commit transaction
        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                newOutstanding: newOutstanding,
                processedAmount: processedAmount
            }
        });

    } catch (error) {
        console.error('❌ Error in recordPayment:', error);
        
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
            message: error.message || 'Failed to record payment' 
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