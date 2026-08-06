const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/dashboard', driverController.getDriverDashboard);
router.get('/trips', driverController.getDriverTrips);
router.put('/trip/status', driverController.updateTripStatus);
router.get('/collections', driverController.getDriverCollections);
router.get('/history', driverController.getDriverHistory);
router.get('/profile', driverController.getDriverProfile); // ✅ ADDED: Driver Profile

module.exports = router;