import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { resultAPI } from '../utils/api';

const Results = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [sortBy, setSortBy] = useState('completedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchResults();
  }, [admin, navigate]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await resultAPI.getResults();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedResults = results
    .filter(result => selectedQuiz === '' || result.quizId === selectedQuiz)
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'completedAt':
          aValue = new Date(a.completedAt);
          bValue = new Date(b.completedAt);
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'percentage':
          aValue = a.percentage;
          bValue = b.percentage;
          break;
        case 'userName':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const uniqueQuizzes = [...new Set(results.map(result => ({
    id: result.quizId,
    title: result.quizTitle
  })))];

  const calculateStats = () => {
    const filteredResults = selectedQuiz 
      ? results.filter(result => result.quizId === selectedQuiz)
      : results;

    if (filteredResults.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const totalAttempts = filteredResults.length;
    const totalScore = filteredResults.reduce((sum, result) => sum + result.score, 0);
    const totalPercentage = filteredResults.reduce((sum, result) => sum + result.percentage, 0);
    const scores = filteredResults.map(result => result.score);

    return {
      totalAttempts,
      averageScore: (totalScore / totalAttempts).toFixed(1),
      averagePercentage: (totalPercentage / totalAttempts).toFixed(1),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  };

  if (loading) {
    return <LoadingSpinner message="Loading results..." />;
  }

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Results</h1>
        <p className="text-gray-600">View and analyze quiz performance data</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</div>
          <div className="text-gray-600 text-sm">Total Attempts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
          <div className="text-gray-600 text-sm">Avg Score</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.averagePercentage}%</div>
          <div className="text-gray-600 text-sm">Avg Percentage</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.highestScore}</div>
          <div className="text-gray-600 text-sm">Highest Score</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{stats.lowestScore}</div>
          <div className="text-gray-600 text-sm">Lowest Score</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="form-input"
            >
              <option value="">All Quizzes</option>
              {uniqueQuizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
            >
              <option value="completedAt">Date Completed</option>
              <option value="score">Score</option>
              <option value="percentage">Percentage</option>
              <option value="userName">User Name</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-input"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Results ({filteredAndSortedResults.length})</h3>
        </div>
        
        {filteredAndSortedResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No results found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.userName}
                        </div>
                        {result.userEmail && (
                          <div className="text-sm text-gray-500">
                            {result.userEmail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.quizTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.score} / {result.totalQuestions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.percentage >= 80
                          ? 'bg-green-100 text-green-800'
                          : result.percentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60).toString().padStart(2, '0')}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(result.completedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
