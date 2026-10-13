

const express = require('express');
const router = express.Router();

const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  setupInterview,
  getInterviewSession,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  deleteInterview,
  getInterviewAnalytics,
} = require('../controllers/interviewController');

const { protect } = authMiddleware;

// Validate imported handlers before registering routes.
const handlers = {
  protect,
  setupInterview,
  getInterviewSession,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  deleteInterview,
};

for (const [name, handler] of Object.entries(handlers)) {
  if (typeof handler !== 'function') {
    throw new Error(
      `Invalid interview route handler: "${name}". Check its export in the corresponding controller or middleware.`
    );
  }
}

if (!upload || typeof upload.single !== 'function') {
  throw new Error(
    'Invalid upload middleware: expected upload.single() to be a function.'
  );
}

// All interview routes require an authenticated user.
router.get('/history', protect, getInterviewHistory);
router.get('/analytics', protect, getInterviewAnalytics);

router.post('/setup', protect, setupInterview);

router.get('/:sessionId', protect, getInterviewSession);

router.post(
  '/answer',
  protect,
  upload.single('video'),
  submitAnswer
);

router.post('/:sessionId/complete', protect, completeInterview);

router.delete('/:sessionId', protect, deleteInterview);

module.exports = router;