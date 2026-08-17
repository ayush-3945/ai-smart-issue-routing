const Complaint = require('../models/Complaint');
const User = require('../models/User'); // Import User model for emails
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { analyzeComplaint } = require('../services/aiService');
const { sendComplaintCreatedEmail, sendStatusUpdatedEmail } = require('../services/emailService'); // Day 23 Email Service

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'complaints', resource_type: resourceType },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    let imageUrl = null;
    let attachments = [];

    // Handle multiple uploaded files (req.files) or single (req.file)
    const filesToUpload = req.files || (req.file ? [req.file] : []);

    for (const file of filesToUpload) {
      const isPdfOrDoc = file.mimetype === 'application/pdf' || file.originalname.match(/\.(pdf|doc|docx)$/i);
      const result = await uploadToCloudinary(file.buffer, isPdfOrDoc ? 'raw' : 'auto');

      const attachmentObj = {
        url: result.secure_url,
        fileType: isPdfOrDoc ? 'document' : 'image',
        fileName: file.originalname
      };
      attachments.push(attachmentObj);

      if (!imageUrl && !isPdfOrDoc) {
        imageUrl = result.secure_url;
      }
    }

    // AI Analysis for Category, Priority, Confidence, Summary & Resolution
    const aiAnalysis = await analyzeComplaint(title, description);

    const complaint = new Complaint({
      title,
      description,
      category: req.body.category || aiAnalysis.category || 'General',
      priority: req.body.priority || aiAnalysis.priority || 'Medium',
      user: req.user._id,
      image: imageUrl,
      attachments: attachments,
      aiConfidence: aiAnalysis.confidence || 0,
      aiSummary: aiAnalysis.summary || null,
      suggestedResolution: aiAnalysis.suggestedResolution || null,
      troubleshootingSteps: aiAnalysis.troubleshootingSteps || [],
    });

    await complaint.save();

    // Day 23: Send Async Confirmation Email to User with AI Analysis
    if (req.user && req.user.email) {
      sendComplaintCreatedEmail(req.user.email, req.user.name || 'User', complaint);
    }

    res.status(201).json({
      message: 'Complaint created and analyzed by AI successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments({ user: req.user._id });

    res.status(200).json({
      complaints,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComplaints: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status === status) {
      return res.status(400).json({ message: 'Complaint already has this status' });
    }

    complaint.status = status;
    await complaint.save();

    // Emit real-time update to the complaint owner only
    const io = req.app.get('io') || req.app.get('socketio');
    if (io) {
      io.emit('statusUpdated', {
        complaintId: complaint._id,
        status: complaint.status,
        updatedAt: complaint.updatedAt,
      });
    }

    // Day 23: Send Async Status Notification Email to User
    const user = await User.findById(complaint.user);
    if (user && user.email) {
      sendStatusUpdatedEmail(user.email, user.name || 'User', complaint);
    }

    res.json({
      message: 'Status updated successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Day 22: AI Feedback Loop - Admin Re-classify
const updateComplaintCategory = async (req, res) => {
  try {
    const { category, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (category) complaint.category = category;
    if (priority) complaint.priority = priority;

    await complaint.save();

    res.status(200).json({
      message: 'Complaint re-classified successfully by Admin',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment to Issue Discussion
const addCommentToComplaint = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const senderUser = await User.findById(req.user.id || req.user._id);
    const senderName = senderUser?.name || req.user.name || 'Anonymous';
    const senderRole = senderUser?.role || req.user.role || 'user';

    const newComment = {
      sender: req.user.id || req.user._id,
      senderName,
      senderRole,
      message: message.trim(),
      createdAt: new Date()
    };

    complaint.comments.push(newComment);
    await complaint.save();

    // Real-time socket broadcast to both user and admin channels
    const io = req.app.get('socketio') || req.app.get('io');
    if (io) {
      io.emit('newComment', {
        complaintId: complaint._id,
        comment: newComment
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
      comments: complaint.comments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createComplaint, 
  getMyComplaints, 
  getAllComplaints, 
  getComplaintById, 
  updateComplaintStatus,
  updateComplaintCategory,
  addCommentToComplaint
};