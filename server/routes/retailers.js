const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', retailerController.getAllRetailers);
router.post('/', retailerController.createRetailer);

module.exports = router;