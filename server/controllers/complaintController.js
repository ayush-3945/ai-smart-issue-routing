const Complaint = require('../models/Complaint');
const User = require('../models/User'); // Import User model for emails
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { analyzeComplaint } = require('../services/aiService');
const { sendComplaintCreatedEmail, sendStatusUpdatedEmail, sendWebhookAlert } = require('../services/emailService'); // Day 23 Email & Webhook Service

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

    const category = req.body.category || aiAnalysis.category || 'General';
    const priority = req.body.priority || aiAnalysis.priority || 'Medium';

    // Smart Department Lead Auto-Assignment
    const DEPARTMENT_LEADS = {
      IT: { name: 'Vikram Sharma', role: 'IT Support Lead' },
      HR: { name: 'Neha Verma', role: 'HR Operations Lead' },
      Finance: { name: 'Rohan Mehta', role: 'Finance Controller' },
      Operations: { name: 'Pooja Singh', role: 'Facilities Lead' },
      General: { name: 'Support Desk', role: 'General Ops' }
    };

    const leadInfo = DEPARTMENT_LEADS[category] || DEPARTMENT_LEADS.General;

    // Parse Live Location Data if provided
    let locationData = {
      latitude: null,
      longitude: null,
      address: null,
      city: null,
      state: null,
      country: null,
      pincode: null,
    };

    if (req.body.location) {
      try {
        const parsedLoc = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
        if (parsedLoc && typeof parsedLoc === 'object') {
          locationData = {
            latitude: parsedLoc.latitude !== undefined && parsedLoc.latitude !== null ? parseFloat(parsedLoc.latitude) : null,
            longitude: parsedLoc.longitude !== undefined && parsedLoc.longitude !== null ? parseFloat(parsedLoc.longitude) : null,
            address: parsedLoc.address || null,
            city: parsedLoc.city || null,
            state: parsedLoc.state || null,
            country: parsedLoc.country || null,
            pincode: parsedLoc.pincode || null,
          };
        } else if (typeof parsedLoc === 'string') {
          locationData.address = parsedLoc;
        }
      } catch (e) {
        locationData.address = req.body.location;
      }
    } else if (req.body.latitude || req.body.longitude || req.body.address) {
      locationData = {
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
        address: req.body.address || null,
        city: req.body.city || null,
        state: req.body.state || null,
        country: req.body.country || null,
        pincode: req.body.pincode || null,
      };
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      assignedTo: leadInfo.name,
      assignedLeadRole: leadInfo.role,
      user: req.user._id,
      image: imageUrl,
      attachments: attachments,
      location: locationData,
      aiConfidence: aiAnalysis.confidence || 0,
      aiSummary: aiAnalysis.summary || null,
      aiSummaryHindi: aiAnalysis.summaryHindi || null,
      detectedLanguage: aiAnalysis.detectedLanguage || 'English',
      suggestedResolution: aiAnalysis.suggestedResolution || null,
      troubleshootingSteps: aiAnalysis.troubleshootingSteps || [],
    });

    await complaint.save();

    // Day 23: Send Async Confirmation Email to User with AI Analysis
    try {
      if (req.user && req.user.email) {
        sendComplaintCreatedEmail(req.user.email, req.user.name || 'User', complaint);
      }
      // Phase 3: Trigger Discord/Slack Webhook Alert for Support Channels
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
      if (webhookUrl) {
        sendWebhookAlert(webhookUrl, complaint);
      }
    } catch (dispatchErr) {
      console.warn('Notification dispatch failed (non-blocking):', dispatchErr.message);
    }

    res.status(201).json({
      message: 'Complaint created and analyzed by AI successfully',
      complaint,
    });
  } catch (error) {
    console.error('Complaint creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create complaint' });
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

    // Day 23: Send Async Status Notification Email to User (Non-blocking)
    try {
      if (complaint.user) {
        const user = await User.findById(complaint.user);
        if (user && user.email) {
          sendStatusUpdatedEmail(user.email, user.name || 'User', complaint);
        }
      }
    } catch (emailErr) {
      console.warn('Status update email failed (non-blocking):', emailErr.message);
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
    const { category, priority, assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (category) {
      complaint.category = category;
      const DEPARTMENT_LEADS = {
        IT: { name: 'Vikram Sharma', role: 'IT Support Lead' },
        HR: { name: 'Neha Verma', role: 'HR Operations Lead' },
        Finance: { name: 'Rohan Mehta', role: 'Finance Controller' },
        Operations: { name: 'Pooja Singh', role: 'Facilities Lead' },
        General: { name: 'Support Desk', role: 'General Ops' }
      };
      if (!assignedTo) {
        complaint.assignedTo = DEPARTMENT_LEADS[category]?.name || 'Support Desk';
        complaint.assignedLeadRole = DEPARTMENT_LEADS[category]?.role || 'General Support';
      }
    }

    if (priority) complaint.priority = priority;
    if (assignedTo) complaint.assignedTo = assignedTo;

    await complaint.save();

    res.status(200).json({
      message: 'Complaint re-classified and assigned successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Re-assign Ticket to Team Member
const updateComplaintAssignee = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.assignedTo = assignedTo || 'Unassigned';
    await complaint.save();

    const io = req.app.get('socketio') || req.app.get('io');
    if (io) {
      io.emit('assigneeUpdated', {
        complaintId: complaint._id,
        assignedTo: complaint.assignedTo
      });
    }

    res.status(200).json({
      message: `Ticket reassigned to ${complaint.assignedTo}`,
      complaint
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

// Day 25: AI Duplicate Issue Detection
const checkDuplicateComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim().length < 4) {
      return res.status(200).json({ duplicates: [] });
    }

    const searchWords = title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4);

    if (searchWords.length === 0) {
      return res.status(200).json({ duplicates: [] });
    }

    const regexQuery = searchWords.map((w) => ({
      $or: [
        { title: { $regex: w, $options: 'i' } },
        { description: { $regex: w, $options: 'i' } }
      ]
    }));

    // Find active or open complaints matching keywords
    const potentialDuplicates = await Complaint.find({
      $and: [
        { status: { $in: ['Pending', 'In Progress'] } },
        { $or: regexQuery.flatMap((r) => r.$or) }
      ]
    })
      .select('title category priority status createdAt aiSummary')
      .limit(3)
      .lean();

    res.status(200).json({
      hasDuplicates: potentialDuplicates.length > 0,
      duplicates: potentialDuplicates
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
  updateComplaintAssignee,
  addCommentToComplaint,
  checkDuplicateComplaint
};