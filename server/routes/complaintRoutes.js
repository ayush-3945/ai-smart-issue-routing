const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getMyComplaints, 
  getComplaintById, 
  updateComplaintStatus,
  getAllComplaints,
  updateComplaintCategory,
  updateComplaintAssignee,
  addCommentToComplaint,
  checkDuplicateComplaint,
  extractOcrData
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const validateComplaint = require('../middleware/validateComplaint');
const upload = require('../middleware/upload');

// Increased body payload size limit might be needed for base64 if not already handled globally.
// In this case, express.json({limit: '10mb'}) should be set in server.js.
router.post('/ocr', protect, extractOcrData);
router.post('/', protect, upload.array('files', 5), validateComplaint, createComplaint);
router.post('/check-duplicate', protect, checkDuplicateComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, getAllComplaints);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, updateComplaintStatus);
router.patch('/:id/category', protect, updateComplaintCategory);
router.patch('/:id/assignee', protect, updateComplaintAssignee);
router.post('/:id/comments', protect, addCommentToComplaint);

module.exports = router;