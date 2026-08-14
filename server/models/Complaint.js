const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Operations', 'General'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: null
  },
  aiConfidence: {
    type: Number,
    default: 0
  },
  aiSummary: {
    type: String,
    default: null
  },
  suggestedResolution: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);