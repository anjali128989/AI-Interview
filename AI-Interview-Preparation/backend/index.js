// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const questionRoutes = require('./routes/questionRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(cors({
  origin: [
    'https://ai-interview-delta-seven.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// FAKE DATA ROUTE: must be BEFORE the interview router
app.get('/api/interview/metrics', (req, res) => {
  res.json({
    speechClarity: 88,
    confidenceScore: [2, 3, 4, 5],
    responseRating: 4.5,
    fillerWordCount: 4,
    fillerWords: ['um', 'like', 'uh'],
    nonVerbal: { eyeContact: 'Good', calm: 'Yes' }
  });
});

app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// Run the server locally only. On Vercel the app is exported instead.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;