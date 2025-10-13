const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

// POST /api/questions - Add new question (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { quizId, questionText, options, correctAnswer } = req.body;

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
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// PUT /api/questions/:id - Update question (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { questionText, options, correctAnswer } = req.body;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { questionText, options, correctAnswer },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/questions/:id - Delete question (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// GET /api/questions/quiz/:quizId - Get all questions for a quiz
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

module.exports = router;
