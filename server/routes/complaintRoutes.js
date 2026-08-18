const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getMyComplaints, 
  getComplaintById, 
  updateComplaintStatus,
  getAllComplaints,
  updateComplaintCategory,
  addCommentToComplaint,
  checkDuplicateComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const validateComplaint = require('../middleware/validateComplaint');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('files', 5), validateComplaint, createComplaint);
router.post('/check-duplicate', protect, checkDuplicateComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, getAllComplaints);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, updateComplaintStatus);
router.patch('/:id/category', protect, updateComplaintCategory);
router.post('/:id/comments', protect, addCommentToComplaint);

module.exports = router;