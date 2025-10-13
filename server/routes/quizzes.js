const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// GET /api/quizzes - Get all active quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// GET /api/quizzes/:id - Get specific quiz
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// GET /api/quizzes/:id/questions - Get questions for a quiz
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.id });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/quizzes - Create new quiz (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const quiz = new Quiz({
      title,
      description,
      category
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// PUT /api/quizzes/:id - Update quiz (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body;
    
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description, category, isActive, updatedAt: Date.now() },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE /api/quizzes/:id - Delete quiz (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Also delete all questions for this quiz
    await Question.deleteMany({ quizId: req.params.id });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

module.exports = router;
