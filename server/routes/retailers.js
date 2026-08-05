const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');
const authMiddleware = require('../middleware/auth');

// Public route - Create retailer (no auth needed)
router.post('/', retailerController.createRetailer);

// Protected routes (auth required)
router.use(authMiddleware);

// Retailer dashboard endpoints
router.get('/me', retailerController.getRetailerInfo);
router.get('/orders', retailerController.getRetailerOrders);
router.get('/stats', retailerController.getRetailerStats);

// Admin routes
router.get('/', retailerController.getAllRetailers);

module.exports = router;