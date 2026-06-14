const express = require('express');
const { registerUser, loginUser, getMe, githubAuth, githubCallback } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

module.exports = router;
