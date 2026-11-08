const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');

// Security section — the super admin only.
router.use(authMiddleware, requireSuperAdmin);

router.get('/overview', superAdminController.getOverview);
router.get('/activity', superAdminController.getActivity);
router.get('/accounts', superAdminController.getAccounts);
router.put('/accounts/:id/password', superAdminController.changePassword);
router.patch('/accounts/:id/status', superAdminController.changeStatus);

module.exports = router;
