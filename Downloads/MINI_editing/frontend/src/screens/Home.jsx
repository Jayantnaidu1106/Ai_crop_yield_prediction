import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Education Ecosystem</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name || user?.email || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <i className="ri-logout-box-line"></i>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-gray-600">
            Select a module below to begin your educational journey
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Study Rooms Card */}
          <div 
            onClick={() => navigate('/studyrooms')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-t-4 border-indigo-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-team-line text-3xl text-indigo-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Study Rooms</h3>
              <p className="text-gray-600 mb-4">
                Collaborate with peers in real-time study sessions with chat and whiteboard
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">Real-time Chat</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">Whiteboard</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">File Sharing</span>
              </div>
            </div>
          </div>

          {/* Quiz Generator Card */}
          <div 
            onClick={() => navigate('/quiz')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-t-4 border-green-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-question-answer-line text-3xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Quiz Generator</h3>
              <p className="text-gray-600 mb-4">
                Upload PDFs and generate AI-powered quizzes to test your knowledge
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">PDF Upload</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">AI Generation</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Auto Grading</span>
              </div>
            </div>
          </div>

          {/* Mock Interview Card */}
          <div 
            onClick={() => navigate('/interview')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-t-4 border-orange-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-user-voice-line text-3xl text-orange-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mock Interview</h3>
              <p className="text-gray-600 mb-4">
                Practice interviews with AI interviewer and get instant feedback
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">AI Interviewer</span>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">Real-time Feedback</span>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">Multiple Domains</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-shield-check-line text-2xl text-blue-600"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Authentication</h4>
              <p className="text-sm text-gray-600">JWT-based secure login</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-rocket-line text-2xl text-purple-600"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Collaboration</h4>
              <p className="text-sm text-gray-600">Socket.io powered interactions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-brain-line text-2xl text-pink-600"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Learning</h4>
              <p className="text-sm text-gray-600">Smart content generation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-bar-chart-line text-2xl text-yellow-600"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Progress Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your learning journey</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
