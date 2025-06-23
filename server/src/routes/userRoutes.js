const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes defined after this middleware will be protected
router.use(authMiddleware.protect);

router.get('/me', userController.getMe);
// router.patch('/updateMe', userController.updateMe);
// router.patch('/updateMyPassword', authController.updatePassword); // This would be in authController

module.exports = router;
