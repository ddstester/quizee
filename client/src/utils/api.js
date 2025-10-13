import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Set base URL
axios.defaults.baseURL = API_BASE_URL;

// Quiz API functions
export const quizAPI = {
  // Get all quizzes
  getQuizzes: async () => {
    const response = await axios.get('/quizzes');
    return response.data;
  },

  // Get single quiz
  getQuiz: async (id) => {
    const response = await axios.get(`/quizzes/${id}`);
    return response.data;
  },

  // Get quiz questions
  getQuizQuestions: async (id) => {
    const response = await axios.get(`/quizzes/${id}/questions`);
    return response.data;
  },

  // Create quiz (admin only)
  createQuiz: async (quizData) => {
    const response = await axios.post('/quizzes', quizData);
    return response.data;
  },

  // Update quiz (admin only)
  updateQuiz: async (id, quizData) => {
    const response = await axios.put(`/quizzes/${id}`, quizData);
    return response.data;
  },

  // Delete quiz (admin only)
  deleteQuiz: async (id) => {
    const response = await axios.delete(`/quizzes/${id}`);
    return response.data;
  }
};

// Question API functions
export const questionAPI = {
  // Create question (admin only)
  createQuestion: async (questionData) => {
    const response = await axios.post('/questions', questionData);
    return response.data;
  },

  // Update question (admin only)
  updateQuestion: async (id, questionData) => {
    const response = await axios.put(`/questions/${id}`, questionData);
    return response.data;
  },

  // Delete question (admin only)
  deleteQuestion: async (id) => {
    const response = await axios.delete(`/questions/${id}`);
    return response.data;
  }
};

// Result API functions
export const resultAPI = {
  // Submit quiz result
  submitResult: async (resultData) => {
    const response = await axios.post('/results', resultData);
    return response.data;
  },

  // Get all results (admin only)
  getResults: async () => {
    const response = await axios.get('/results');
    return response.data;
  },

  // Get results for specific quiz (admin only)
  getQuizResults: async (quizId) => {
    const response = await axios.get(`/results/quiz/${quizId}`);
    return response.data;
  },

  // Get quiz statistics (admin only)
  getQuizStats: async (quizId) => {
    const response = await axios.get(`/results/stats/${quizId}`);
    return response.data;
  }
};

// Admin API functions
export const adminAPI = {
  // Get dashboard data
  getDashboard: async () => {
    const response = await axios.get('/admin/dashboard');
    return response.data;
  }
};
