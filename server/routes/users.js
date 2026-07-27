const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:id/toggle-status', userController.toggleStatus);

module.exports = router;