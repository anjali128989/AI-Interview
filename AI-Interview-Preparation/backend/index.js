// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); 
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
/*const analyticsRoutes = require('./routes/analyticsRoutes');*/
const questionRoutes = require('./routes/questionRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(cors(
));
app.use(express.json({limit: '100mb' }));
app.use(express.urlencoded({ extended: true , limit: "100mb"}));
/*app.use('/api', analyticsRoutes);*/
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// FAKE DATA ROUTE (This mimics the AI analyzing you)
app.get('/api/interview/metrics', (req, res) => {
  res.json({
    speechClarity: 88,
    confidenceScore: [2, 3, 4, 5], // Data for the graph
    responseRating: 4.5,
    fillerWordCount: 4,
    fillerWords: ['um', 'like', 'uh'],
    nonVerbal: { eyeContact: 'Good', calm: 'Yes' }
  });
});

const PORT = 5000;
connectDB(); 


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));