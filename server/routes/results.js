const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const auth = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { 
      quizId, 
      quizTitle, 
      userName, 
      userEmail, 
      score, 
      totalQuestions, 
      answers, 
      timeSpent,
      screenEvents // Accept screenEvents array
    } = req.body;

    // Validate required fields
    if (!quizId || !quizTitle || !userName || score === undefined || !totalQuestions || !answers) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);

    const result = new Result({
      quizId,
      quizTitle,
      userName,
      userEmail: userEmail || '',
      score,
      totalQuestions,
      percentage,
      answers,
      timeSpent: timeSpent || 0,
      ipAddress: req.ip || req.connection.remoteAddress,
      screenEvents: screenEvents || [], // Store or default empty

    });

    await result.save();
    res.status(201).json({
      message: 'Result saved successfully',
      result: {
        score,
        totalQuestions,
        percentage,
        completedAt: result.completedAt
      }
    });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// GET /api/results - Get all results (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const results = await Result.find({})
      .populate('quizId', 'title')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});


// GET /api/results/quiz/:quizId - Get results for specific quiz (Admin only)
router.get('/quiz/:quizId', auth, async (req, res) => {
  try {
    const results = await Result.find({ quizId: req.params.quizId })
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
});

// GET /api/results/stats/:quizId - Get quiz statistics (Admin only)
router.get('/stats/:quizId', auth, async (req, res) => {
  try {
    const results = await Result.find({ quizId: req.params.quizId });

    if (results.length === 0) {
      return res.json({
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        highestScore: 0,
        lowestScore: 0
      });
    }

    const totalAttempts = results.length;
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
    const scores = results.map(result => result.score);

    const stats = {
      totalAttempts,
      averageScore: Math.round(totalScore / totalAttempts * 100) / 100,
      averagePercentage: Math.round(totalPercentage / totalAttempts * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz statistics' });
  }
});

module.exports = router;
