const mongoose = require('mongoose');

const mineSiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  centerLat: {
    type: Number,
    required: true,
  },
  centerLng: {
    type: Number,
    required: true,
  },
  radiusMeters: {
    type: Number,
    default: 500,
  }
}, { timestamps: true });

module.exports = mongoose.model('MineSite', mineSiteSchema);
