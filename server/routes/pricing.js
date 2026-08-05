const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const authMiddleware = require('../middleware/auth');

// Public route - get current pricing
router.get('/current', pricingController.getCurrentPricing);

// Protected route - update pricing (admin only)
router.put('/update', authMiddleware, pricingController.updatePricing);

module.exports = router;