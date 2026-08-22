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
    enum: ['Safety', 'Environment', 'Production', 'Labour', 'Equipment', 'General', 'IT', 'HR', 'Finance', 'Operations'],
    default: 'General'
  },
  mineSite: {
    type: String,
    default: 'Jharia Colliery - Pit 4',
    trim: true
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
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  assignedLeadRole: {
    type: String,
    default: 'Mine Safety & Operations Desk'
  },
  image: {
    type: String,
    default: null
  },
  attachments: [
    {
      url: { type: String, required: true },
      fileType: { type: String, default: 'image' }, // 'image' | 'document'
      fileName: { type: String, default: 'Attachment' }
    }
  ],
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    pincode: { type: String, default: null }
  },
  aiConfidence: {
    type: Number,
    default: 0
  },
  aiSummary: {
    type: String,
    default: null
  },
  aiSummaryHindi: {
    type: String,
    default: null
  },
  detectedLanguage: {
    type: String,
    default: 'English'
  },
  suggestedResolution: {
    type: String,
    default: null
  },
  troubleshootingSteps: [
    {
      type: String
    }
  ],
  comments: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      senderName: {
        type: String,
        default: 'Anonymous'
      },
      senderRole: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);