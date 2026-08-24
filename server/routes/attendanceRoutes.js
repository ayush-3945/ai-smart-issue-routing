const express = require('express');
const { markAttendance, getAttendanceLogs, seedMineSite } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, markAttendance);
router.get('/', protect, admin, getAttendanceLogs);
router.post('/seed', seedMineSite);

module.exports = router;
