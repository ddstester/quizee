const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const { route } = require('./quizzes');
const {
  GoogleGenerativeAI
} = require("@google/generative-ai");

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

router.post('/prompt', auth, async (req, res) => {
  try {
    const { prompt, quizid } = req.body;
    const promp = `Take this TASK=${prompt} in json formate.
    Output format should be a JSON array of objects.e.g=
         {"questionText": "[Question on given task]",
          "options": ["option1","option2","option3","option4"],
          "correctAnswer": [no. of the correct option in integer]}`;
    const genAI = new GoogleGenerativeAI("AIzaSyA9B_nP12dTgb4END_SYzEhdIGD2fmCuEs");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    try {
      const result = await model.generateContent(promp);
      const responseText = result.response.text();
      console.log(responseText);
      const modified = responseText.replace(/`/g, "");
      const modified2 = modified.replace("json", "");
      let questions = JSON.parse(modified2);
      res.status(200).json(questions);
      //save the quiz to database 
      const quizId = quizid;
      for (let i = 0; i < questions.length; i++) {
        try {
          let obj = questions[i]
          const questionText = obj.questionText, options = obj.options, correctAnswer = obj.correctAnswer;
          // console.log(obj.questionText)

          // Validate input
          if (!quizId || !questionText || !options || correctAnswer === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
          }

          if (options.length !== 4) {
            return res.status(400).json({ error: 'Exactly 4 options are required' });
          }

          if (correctAnswer < 0 || correctAnswer > 3) {
            return res.status(400).json({ error: 'Correct answer must be between 0-3' });
          }

          // Check if quiz exists
          const quiz = await Quiz.findById(quizId);
          if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
          }

          const question = new Question({
            quizId,
            questionText,
            options,
            correctAnswer
          });

          await question.save();
          // res.status(201).json(question);
        } catch (error) {
          console.log(error)
          res.status(500).json({ error: 'Failed to create question' });
        }
      }
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  };
})
module.exports = router;
