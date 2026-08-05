const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');
const authMiddleware = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
// Create retailer (Admin only - but no auth here for registration)
router.post('/', retailerController.createRetailer);

// ============================================
// PROTECTED ROUTES (Auth required)
// ============================================
router.use(authMiddleware);

// ✅ Admin routes
router.get('/', retailerController.getAllRetailers);
router.get('/customers', retailerController.getRetailerCustomers); // ✅ NEW

// ✅ Retailer dashboard routes
router.get('/me', retailerController.getRetailerInfo);
router.get('/orders', retailerController.getRetailerOrders);
router.get('/stats', retailerController.getRetailerStats);

module.exports = router;