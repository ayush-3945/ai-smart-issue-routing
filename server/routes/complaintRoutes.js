const express = require('express');
const router = express.Router();
const { createComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const validateComplaint = require('../middleware/validateComplaint');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('image'), validateComplaint, createComplaint);

module.exports = router;  //I need to restart now beacuse token will be expired