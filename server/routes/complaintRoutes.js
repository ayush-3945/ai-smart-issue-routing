const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints, getComplaintById } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const validateComplaint = require('../middleware/validateComplaint');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('image'), validateComplaint, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);

module.exports = router;