
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use Vercel's temporary writable directory in production.
// Keep the existing uploads folder for local development.
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'interview-recordings')
  : path.join(__dirname, '../uploads/interview-recordings');

// Create the directory if it does not exist.
fs.mkdirSync(uploadDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(
      null,
      `answer-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  }
});

// Allow video files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

// Configure Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  }
});

module.exports = upload;