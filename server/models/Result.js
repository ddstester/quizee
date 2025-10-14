const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  quizTitle: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userEmail: {
    type: String,
    trim: true,
    maxlength: 200
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: ''
  },
  screenEvents: [{
    event: String,
    timestamp: String
  }]
});

module.exports = mongoose.model('Result', ResultSchema);
