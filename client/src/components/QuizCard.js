import React from 'react';
import { Link } from 'react-router-dom';

const QuizCard = ({ quiz }) => {
  return (
    <div className="quiz-card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {quiz.category}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{quiz.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created: {new Date(quiz.createdAt).toLocaleDateString()}
        </span>
        <Link 
          to={`/quiz/${quiz._id}`}
          className="btn-primary"
        >
          Take Quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizCard;
