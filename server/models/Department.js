const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  head: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  categories: [{
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Operations', 'General']
  }]
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);