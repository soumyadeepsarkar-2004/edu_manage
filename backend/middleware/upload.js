const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use /tmp on Vercel (read-only filesystem), local uploads/ in dev
const UPLOAD_BASE = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads';

// Ensure upload directories exist (safe for serverless)
const uploadDirs = [`${UPLOAD_BASE}/documents`, `${UPLOAD_BASE}/profiles`];
try {
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (e) {
  console.warn('Could not create upload dirs:', e.message);
}

// Storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${UPLOAD_BASE}/documents`;
    try { fs.mkdirSync(dest, { recursive: true }); } catch (e) { }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG), PDFs, and documents (DOC, DOCX) are allowed!'));
  }
};

// Upload middleware for documents
const uploadDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: documentFilter
}).array('documents', 5); // Allow up to 5 documents

module.exports = {
  uploadDocuments
};
