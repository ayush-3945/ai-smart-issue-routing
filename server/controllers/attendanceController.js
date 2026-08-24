const Attendance = require('../models/Attendance');
const MineSite = require('../models/MineSite');
const User = require('../models/User');

// Haversine formula to calculate distance between two lat/lng pairs in meters
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) *
            Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

exports.markAttendance = async (req, res) => {
  try {
    const { lat, lng, action } = req.body;
    const workerId = req.user.id;

    if (!lat || !lng || !action) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // For the hackathon, we assume there is at least one mine site.
    // In production, the worker would be assigned to a specific mine site.
    let mineSite = await MineSite.findOne();
    if (!mineSite) {
      return res.status(404).json({ success: false, message: 'No mine sites configured in the system.' });
    }

    const distance = getDistanceMeters(lat, lng, mineSite.centerLat, mineSite.centerLng);
    const status = distance <= mineSite.radiusMeters ? 'Verified' : 'Flagged - Outside Range';

    const attendance = await Attendance.create({
      workerId,
      mineSiteId: mineSite._id,
      action,
      lat,
      lng,
      distanceFromSite: distance,
      status
    });

    res.status(201).json({
      success: true,
      data: attendance,
      message: status === 'Verified' ? `Verified: On-site. Punched ${action.split('_')[1]} successfully!` : `Flagged: You are ${(distance/1000).toFixed(2)} km away from the mine site.`
    });
  } catch (error) {
    console.error('Error in markAttendance:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate('workerId', 'name email phone role')
      .populate('mineSiteId', 'name')
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('Error in getAttendanceLogs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.seedMineSite = async (req, res) => {
  try {
    let mineSite = await MineSite.findOne({ name: 'Jharia Coal Field (Dhanbad)' });
    if (!mineSite) {
      mineSite = await MineSite.create({
        name: 'Jharia Coal Field (Dhanbad)',
        centerLat: 23.7431,
        centerLng: 86.4116,
        radiusMeters: 500
      });
      return res.status(201).json({ success: true, message: 'Mine site seeded', data: mineSite });
    }
    res.status(200).json({ success: true, message: 'Mine site already exists', data: mineSite });
  } catch (error) {
    console.error('Error in seedMineSite:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
