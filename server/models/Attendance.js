const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mineSiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MineSite',
    required: true,
  },
  action: {
    type: String,
    enum: ['PUNCH_IN', 'PUNCH_OUT'],
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  distanceFromSite: {
    type: Number, // in meters
    required: true,
  },
  status: {
    type: String,
    enum: ['Verified', 'Flagged - Outside Range'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
