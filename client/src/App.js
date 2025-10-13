import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';

function App() {
    return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/results" element={<Results />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
