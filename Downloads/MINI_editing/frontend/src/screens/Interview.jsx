import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Interview = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-orange-600">Mock Interview</h1>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-8">
            <i className="ri-user-voice-line text-8xl text-orange-600 mb-4"></i>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Mock Interview</h2>
            <p className="text-xl text-gray-600">
              Practice your interview skills with an AI-powered interviewer
            </p>
          </div>

          {/* Live CTA for mock interviews */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-500 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-orange-800 mb-3">Mock Interviews are live</h3>
            <p className="text-orange-700 text-lg mb-6">
              Create an interview from your resume or a job description, practice with the AI avatar, and get instant feedback.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/mock-interview/new')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md font-semibold shadow"
              >
                Start New Mock Interview
              </button>
              <button
                onClick={() => navigate('/mock-interview')}
                className="bg-white border border-orange-500 text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-md font-semibold"
              >
                View My Interviews
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-robot-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">AI Interviewer</h4>
              <p className="text-gray-600">
                Intelligent AI asks relevant questions based on your field
              </p>
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-question-answer-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Market-Level Difficulty</h4>
              <p className="text-gray-600">
                Choose from Easy, Medium, or Hard difficulty levels
              </p>
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-feedback-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Feedback</h4>
              <p className="text-gray-600">
                Get instant feedback on your answers and communication
              </p>
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-history-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Interview History</h4>
              <p className="text-gray-600">
                Review past interviews and track your improvement
              </p>
            </div>
          </div>

          {/* Quick links to the live flow */}
          <div className="border-2 border-gray-200 rounded-lg p-8 bg-white mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Jump into a session</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/mock-interview/new')}
                className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold shadow hover:bg-orange-700"
              >
                Create & Generate Questions
              </button>
              <button
                onClick={() => navigate('/mock-interview')}
                className="px-8 py-3 rounded-lg bg-gray-100 text-gray-800 font-semibold border border-orange-200 hover:bg-orange-50"
              >
                Go to Dashboard
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Uses the AI avatar session and feedback flow now available in Mock Interviews.
            </p>
          </div>

          {/* Interview Types */}
          <div className="text-left mb-8">
            <h4 className="font-bold text-gray-900 mb-4 text-center">What’s included now</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-code-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">AI Avatar Session</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-feedback-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">Auto Feedback</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-history-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">Interview History</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-question-answer-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">Generated Questions</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interview;
