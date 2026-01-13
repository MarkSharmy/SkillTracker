const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const goalRoutes = require('./routes/goalRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors()); // Allows your React & React Native apps to communicate with the server
app.use(express.json()); // Parses incoming JSON requests

// 2. Database Connection
// Connects to MongoDB as per Technical Requirement 1.2
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to SkillTracker Database'))
  .catch((err) => console.error('❌ Database connection error:', err));

// 3. Basic Route for Testing
app.get('/', (req, res) => {
  res.send('SkillTracker API is running...');
});

// 4. Routes (To be developed)
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subtasks', subtaskRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// 5. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
});