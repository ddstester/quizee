const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Create default admin if doesn't exist
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin2' });
    if (!adminExists) {
      const defaultAdmin = new Admin({
        username: 'admin2',
        password: 'admin@123'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Call this when server starts
createDefaultAdmin();

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/admin/verify - Verify token
router.post('/verify', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// GET /api/admin/dashboard - Get dashboard data (Admin only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const Quiz = require('../models/Quiz');
    const Question = require('../models/Question');
    const Result = require('../models/Result');

    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAttempts = await Result.countDocuments();
    const recentResults = await Result.find({})
      .populate('quizId', 'title')
      .sort({ completedAt: -1 })
      .limit(5);

    res.json({
      totalQuizzes,
      totalQuestions,
      totalAttempts,
      recentResults
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
