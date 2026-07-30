const Complaint = require('../models/Complaint');

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      user: req.user._id,
    });

    await complaint.save();

    res.status(201).json({
      message: 'Complaint created successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComplaint };