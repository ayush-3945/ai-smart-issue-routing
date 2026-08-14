const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getMyComplaints, 
  getComplaintById, 
  updateComplaintStatus,
  getAllComplaints // <-- Naya controller import
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const validateComplaint = require('../middleware/validateComplaint');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('image'), validateComplaint, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, adminOnly, getAllComplaints); // <-- Naya Admin route
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, adminOnly, updateComplaintStatus);

module.exports = router;