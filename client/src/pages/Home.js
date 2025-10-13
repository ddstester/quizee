import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { admin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Welcome to QuizApp
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Test your knowledge with our interactive quizzes. Choose from various categories 
          and challenge yourself with questions designed to help you learn and grow.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-3">Take Quizzes</h3>
            <p className="text-gray-600 mb-4">
              Explore our collection of quizzes and test your knowledge across different topics.
            </p>
            <Link 
              to="/quizzes" 
              className="btn-primary inline-block"
            >
              Browse Quizzes
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-3">
              {admin ? 'Admin Dashboard' : 'Admin Panel'}
            </h3>
            <p className="text-gray-600 mb-4">
              {admin 
                ? 'Manage quizzes, questions, and view user results.'
                : 'Login to manage quizzes and view analytics.'
              }
            </p>
            <Link 
              to={admin ? "/admin/dashboard" : "/admin/login"} 
              className="btn-primary inline-block"
            >
              {admin ? 'Go to Dashboard' : 'Admin Login'}
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Interactive Quizzes</h4>
              <p className="text-gray-600 text-sm">
                Engaging multiple-choice questions with immediate feedback
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Real-time Results</h4>
              <p className="text-gray-600 text-sm">
                Get your scores instantly and track your progress
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Admin Dashboard</h4>
              <p className="text-gray-600 text-sm">
                Comprehensive management tools for creating and managing quizzes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
