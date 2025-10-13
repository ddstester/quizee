const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  options: [{
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation to ensure exactly 4 options
QuestionSchema.pre('save', function(next) {
  if (this.options.length !== 4) {
    return next(new Error('Each question must have exactly 4 options'));
  }
  next();
});

module.exports = mongoose.model('Question', QuestionSchema);
