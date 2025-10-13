import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionForm from '../components/QuestionForm';
import { quizAPI, questionAPI, adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
    fetchQuizzes();
  }, [admin, navigate]);

  const fetchDashboardData = async () => {
    try {
      const data = await adminAPI.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const data = await quizAPI.getQuizQuestions(quizId);
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizAPI.createQuiz(quizForm);
      setQuizForm({ title: '', description: '', category: '' });
      setShowQuizForm(false);
      fetchQuizzes();
      alert('Quiz created successfully!');
    } catch (error) {
      alert('Failed to create quiz. Please try again.');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? All questions will also be deleted.')) {
      try {
        await quizAPI.deleteQuiz(quizId);
        fetchQuizzes();
        if (selectedQuiz && selectedQuiz._id === quizId) {
          setSelectedQuiz(null);
          setQuestions([]);
        }
        alert('Quiz deleted successfully!');
      } catch (error) {
        alert('Failed to delete quiz. Please try again.');
      }
    }
  };

  const handleCreateQuestion = async (questionData) => {
    try {
      await questionAPI.createQuestion({
        ...questionData,
        quizId: selectedQuiz._id
      });
      setShowQuestionForm(false);
      fetchQuestions(selectedQuiz._id);
      alert('Question added successfully!');
    } catch (error) {
      alert('Failed to add question. Please try again.');
    }
  };

  const handleUpdateQuestion = async (questionData) => {
    try {
      await questionAPI.updateQuestion(editingQuestion._id, questionData);
      setEditingQuestion(null);
      setShowQuestionForm(false);
      fetchQuestions(selectedQuiz._id);
      alert('Question updated successfully!');
    } catch (error) {
      alert('Failed to update question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionAPI.deleteQuestion(questionId);
        fetchQuestions(selectedQuiz._id);
        alert('Question deleted successfully!');
      } catch (error) {
        alert('Failed to delete question. Please try again.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {admin?.username}!</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'quizzes', label: 'Manage Quizzes' },
            { id: 'questions', label: 'Manage Questions' },
            { id: 'results', label: 'Results' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'results') {
                  navigate('/admin/results');
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.totalQuizzes}
            </div>
            <div className="text-gray-600">Total Quizzes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.totalQuestions}
            </div>
            <div className="text-gray-600">Total Questions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.totalAttempts}
            </div>
            <div className="text-gray-600">Quiz Attempts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {quizzes.filter(q => q.isActive).length}
            </div>
            <div className="text-gray-600">Active Quizzes</div>
          </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quiz Management</h2>
            <button
              onClick={() => setShowQuizForm(!showQuizForm)}
              className="btn-primary"
            >
              {showQuizForm ? 'Cancel' : 'Create New Quiz'}
            </button>
          </div>

          {/* Quiz Creation Form */}
          {showQuizForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Create New Quiz</h3>
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="form-input"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={quizForm.category}
                    onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary">
                    Create Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuizForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quiz List */}
          <div className="grid gap-4">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <p className="text-gray-600 mb-2">{quiz.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {quiz.category}</span>
                      <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        fetchQuestions(quiz._id);
                        setActiveTab('questions');
                      }}
                      className="btn-secondary text-sm"
                    >
                      Manage Questions
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Question Management</h2>
              {selectedQuiz && (
                <p className="text-gray-600">Managing questions for: {selectedQuiz.title}</p>
              )}
            </div>
            {selectedQuiz && (
              <button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="btn-primary"
              >
                {showQuestionForm ? 'Cancel' : 'Add New Question'}
              </button>
            )}
          </div>

          {!selectedQuiz ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Select a quiz to manage its questions</p>
              <button
                onClick={() => setActiveTab('quizzes')}
                className="btn-primary"
              >
                Go to Quiz Management
              </button>
            </div>
          ) : (
            <>
              {/* Question Form */}
              {showQuestionForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h3>
                  <QuestionForm
                    onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                    onCancel={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                    }}
                    initialData={editingQuestion}
                  />
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg shadow">
                    <p className="text-gray-600">No questions found for this quiz.</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div key={question._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">
                          Question {index + 1}: {question.questionText}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingQuestion(question);
                              setShowQuestionForm(true);
                            }}
                            className="btn-secondary text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-gray-50'
                              }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                            {optionIndex === question.correctAnswer && ' ✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
