import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-white text-2xl font-bold">
            QuizApp
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className={`text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-colors ${isActive('/')}`}
            >
              Home
            </Link>
            <Link 
              to="/quizzes" 
              className={`text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-colors ${isActive('/quizzes')}`}
            >
              Quizzes
            </Link>
            
            {admin ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-colors ${isActive('/admin/dashboard')}`}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
                >
                  Logout ({admin.username})
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className={`text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-colors ${isActive('/admin/login')}`}
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
