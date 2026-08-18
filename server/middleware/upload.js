const multer = require('multer');
const path = require('path');

// Memory storage for streamifier buffer upload to Cloudinary
const storage = multer.memoryStorage();

// File filter for images, pdf and docs
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype.includes('document');

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter
});

module.exports = upload;