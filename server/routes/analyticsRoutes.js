const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Sirf Admin user hi analytics dekh sakta hai
router.get('/dashboard', protect, adminOnly, getDashboardAnalytics);

module.exports = router;