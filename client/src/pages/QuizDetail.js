import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { quizAPI, resultAPI } from '../utils/api';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizAPI.getQuiz(id),
        quizAPI.getQuizQuestions(id)
      ]);
      
      setQuiz(quizData);
      setQuestions(questionsData);
      setAnswers(new Array(questionsData.length).fill(null));
    } catch (error) {
      setError('Failed to load quiz. Please try again.');
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (!userName.trim()) {
      alert('Please enter your name to start the quiz.');
      return;
    }
    setShowUserForm(false);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (answers.includes(null)) {
      const unanswered = answers.findIndex(answer => answer === null) + 1;
      if (!window.confirm(`You haven't answered question ${unanswered}. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    
    try {
      // Calculate score
      let score = 0;
      const detailedAnswers = questions.map((question, index) => {
        const isCorrect = answers[index] === question.correctAnswer;
        if (isCorrect) score++;
        
        return {
          questionId: question._id,
          selectedAnswer: answers[index] !== null ? answers[index] : -1,
          isCorrect
        };
      });

      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

      // Submit result to database
      await resultAPI.submitResult({
        quizId: quiz._id,
        quizTitle: quiz.title,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        score,
        totalQuestions: questions.length,
        answers: detailedAnswers,
        timeSpent
      });

      setShowResults(true);
    } catch (error) {
      setError('Failed to submit quiz results. Please try again.');
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => navigate('/quizzes')}
          className="btn-primary"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Quiz Not Available</h2>
        <p className="text-gray-600 mb-4">This quiz doesn't have any questions yet.</p>
        <button 
          onClick={() => navigate('/quizzes')}
          className="btn-primary"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // User information form
  if (showUserForm) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{quiz.title}</h2>
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="form-input"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Quiz Information:</h4>
          <p className="text-blue-700 text-sm">
            • {questions.length} questions<br/>
            • Multiple choice<br/>
            • Your results will be saved
          </p>
        </div>

        <button 
          onClick={startQuiz}
          className="w-full btn-primary mt-6"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const score = answers.reduce((total, answer, index) => {
      return answer === questions[index].correctAnswer ? total + 1 : total;
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600">Great job, {userName}!</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Review Your Answers:</h3>
          {questions.map((question, index) => (
            <div key={index} className="border rounded-lg p-4">
              <p className="font-medium mb-2">
                {index + 1}. {question.questionText}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    className={`p-2 rounded text-sm ${
                      optionIndex === question.correctAnswer
                        ? 'bg-green-100 text-green-800 font-medium'
                        : answers[index] === optionIndex
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-50'
                    }`}
                  >
                    {option}
                    {optionIndex === question.correctAnswer && ' ✓'}
                    {answers[index] === optionIndex && optionIndex !== question.correctAnswer && ' ✗'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/quizzes')}
            className="btn-primary flex-1"
          >
            Take Another Quiz
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary flex-1"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {question.questionText}
        </h2>

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-secondary'
            }`}
          >
            Previous
          </button>

          <button
            onClick={nextQuestion}
            disabled={answers[currentQuestion] === null || submitting}
            className={`px-6 py-2 rounded-lg font-medium ${
              answers[currentQuestion] === null || submitting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <div className="loading-spinner h-4 w-4 mr-2"></div>
                Submitting...
              </span>
            ) : currentQuestion === questions.length - 1 ? (
              'Submit Quiz'
            ) : (
              'Next Question'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
