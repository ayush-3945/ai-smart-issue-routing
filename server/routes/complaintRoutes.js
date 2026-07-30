const express = require('express');
const router = express.Router();
const { createComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const validateComplaint = require('../middleware/validateComplaint');

router.post('/', protect, validateComplaint, createComplaint);

module.exports = router;