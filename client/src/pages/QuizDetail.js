import React, { useState, useEffect, useRef } from 'react';

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

  const [screenSharingActive, setScreenSharingActive] = useState(false);
  const [screenSharingError, setScreenSharingError] = useState('');
  const [screenStream, setScreenStream] = useState(null);

  const screenEventsRef = useRef([]);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizAPI.getQuiz(id),
        quizAPI.getQuizQuestions(id),
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
      setAnswers(new Array(questionsData.length).fill(null));
    } catch (err) {
      setError('Failed to load quiz. Please try again.');
      console.error('Error fetching quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  const startQuiz = async () => {
    if (!userName.trim()) {
      alert('Please enter your name to start the quiz.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      enterFullscreen();
      setScreenSharingActive(true);
      setShowUserForm(false);
      setStartTime(Date.now());
      screenEventsRef.current = [];
    } catch (err) {
      setScreenSharingError('Screen sharing is required to take this quiz.');
      alert('Screen sharing is required to start the quiz.');
    }
  };

  useEffect(() => {
    if (!screenSharingActive) return;

    function recordEvent(type) {
      screenEventsRef.current.push({
        event: type,
        timestamp: new Date().toISOString(),
      });
      alert('Warning: You switched tabs or minimized the window! This will be recorded.');
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') recordEvent('tab-hidden');
      if (document.visibilityState === 'visible') recordEvent('tab-visible');
    }

    function handleBlur() {
      recordEvent('blur');
    }

    function handleFocus() {
      recordEvent('focus');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [screenSharingActive]);

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

  const stopScreenSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const submitQuiz = async () => {
    if (answers.includes(null)) {
      const unanswered = answers.findIndex((answer) => answer === null) + 1;
      if (!window.confirm(`You haven't answered question ${unanswered}. Submit anyway?`)) {
        return;
      }
    }
    setSubmitting(true);
    try {
      let score = 0;
      const detailedAnswers = questions.map((question, index) => {
        const isCorrect = answers[index] === question.correctAnswer;
        if (isCorrect) score++;
        return {
          questionId: question._id,
          selectedAnswer: answers[index] !== null ? answers[index] : -1,
          isCorrect,
        };
      });
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

      await resultAPI.submitResult({
        quizId: quiz._id,
        quizTitle: quiz.title,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        score,
        totalQuestions: questions.length,
        answers: detailedAnswers,
        timeSpent,
        screenEvents: screenEventsRef.current,
      });
      
      setShowResults(true);

      // Stop screen sharing and exit fullscreen
      stopScreenSharing();

    } catch (err) {
      setError('Failed to submit quiz results. Please try again.');
      console.error('Error submitting quiz:', err);
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
        <button onClick={() => navigate('/quizzes')} className="btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (showUserForm) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{quiz.title}</h2>
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
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
            • {questions.length} questions
            <br />
            • Multiple choice
            <br />
            • Your results will be saved
          </p>
        </div>
        <button onClick={startQuiz} className="w-full btn-primary mt-6">
          Share Screen and Start Quiz
        </button>
        {screenSharingError && <p className="text-red-600 mt-4">{screenSharingError}</p>}
      </div>
    );
  }

  if (showResults) {
    const score = answers.reduce((total, answer, index) => {
      return answer === questions[index].correctAnswer ? total + 1 : total;
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600">Great job, {userName}!</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-gray-600 text-sm">Correct Answers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{percentage}%</div>
              <div className="text-gray-600 text-sm">Score</div>
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
          <button onClick={() => navigate('/quizzes')} className="btn-primary flex-1">
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

  if (!screenSharingActive) {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 rounded shadow text-center">
        {screenSharingError ? (
          <div className="text-red-600">{screenSharingError}</div>
        ) : (
          <div>Please share your screen to start the quiz.</div>
        )}
      </div>
    );
  }

  if (questions.length === 0) {
    return <LoadingSpinner message="Loading questions..." />;
  }

  const q = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Question {currentQuestion + 1} of {questions.length}
      </h2>
      <p className="text-lg font-medium mb-4">{q.questionText}</p>
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className={`block w-full p-3 rounded-md border text-left text-gray-700 font-medium hover:bg-blue-100 transition-colors ${
              answers[currentQuestion] === idx
                ? 'bg-blue-200 border-blue-500'
                : 'border-gray-300'
            }`}
            onClick={() => handleAnswerSelect(idx)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className={`px-6 py-2 rounded-md font-semibold ${
            currentQuestion === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Previous
        </button>
        <button
          onClick={nextQuestion}
          disabled={answers[currentQuestion] === null || submitting}
          className={`px-6 py-2 rounded-md font-semibold ${
            answers[currentQuestion] === null || submitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {submitting ? 'Submitting...' : currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizDetail;
