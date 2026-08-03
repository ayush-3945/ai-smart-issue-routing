const Complaint = require('../models/Complaint');
const cloudinary = require('../config/cloudinary');

const streamifier = require('streamifier');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'complaints' },
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
    const { title, description, category, priority } = req.body;

    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      user: req.user._id,
      image: imageUrl,
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