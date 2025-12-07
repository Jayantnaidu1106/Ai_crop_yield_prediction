import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileUpload = (e) => {
    setPdfFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-green-600">Quiz Generator</h1>
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
            <i className="ri-file-list-3-line text-8xl text-green-600 mb-4"></i>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Quiz Generator</h2>
            <p className="text-xl text-gray-600">
              Upload your study materials and let AI generate intelligent quizzes
            </p>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              🚧 Coming Soon! 🚧
            </h3>
            <p className="text-green-700 text-lg mb-4">
              This module is currently under development. Soon you'll be able to:
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-green-200 rounded-lg p-6 text-left">
              <i className="ri-upload-cloud-line text-4xl text-green-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">PDF Upload</h4>
              <p className="text-gray-600">
                Upload your study PDFs, notes, or textbook chapters
              </p>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-6 text-left">
              <i className="ri-brain-line text-4xl text-green-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">AI Question Generation</h4>
              <p className="text-gray-600">
                AI analyzes content and generates relevant questions using RAG
              </p>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-6 text-left">
              <i className="ri-checkbox-multiple-line text-4xl text-green-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Multiple Question Types</h4>
              <p className="text-gray-600">
                MCQ, True/False, Short Answer, and more
              </p>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-6 text-left">
              <i className="ri-bar-chart-line text-4xl text-green-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Performance Analytics</h4>
              <p className="text-gray-600">
                Track your progress with detailed analytics and insights
              </p>
            </div>
          </div>

          {/* Mock Upload Area (Disabled) */}
          <div className="border-4 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 opacity-50">
            <i className="ri-file-add-line text-6xl text-gray-400 mb-4"></i>
            <p className="text-gray-500 text-lg mb-4">
              Upload PDF (Coming Soon)
            </p>
            <input
              type="file"
              accept=".pdf"
              disabled
              className="hidden"
              onChange={handleFileUpload}
            />
            <button 
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
            >
              Select PDF File
            </button>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">Planned Technology Stack:</h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white px-4 py-2 rounded-full border border-green-300">OpenAI GPT-4</span>
              <span className="bg-white px-4 py-2 rounded-full border border-green-300">RAG (Retrieval-Augmented Generation)</span>
              <span className="bg-white px-4 py-2 rounded-full border border-green-300">Vector Database</span>
              <span className="bg-white px-4 py-2 rounded-full border border-green-300">PDF Parser</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
