import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInterview, generateQuestions } from '../api/mockInterviewApi';

const NewMockInterview = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [sourceType, setSourceType] = useState('resume');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !sourceType) {
      setError('Title and source type are required');
      return;
    }
    const textPayload = sourceType === 'resume' ? (resumeText || resumeFile) : jobDescription;
    if (!textPayload) {
      setError('Please provide resume text or upload a file, or provide a job description');
      return;
    }

    try {
      setLoading(true);
      // 1) Extract resume text if file is provided and no manual text
      let finalResumeText = resumeText || undefined;
      if (sourceType === 'resume' && resumeFile && !resumeText) {
        try {
          finalResumeText = await resumeFile.text();
        } catch (fileErr) {
          throw new Error('Could not read file as text. Please paste resume text instead or use a .txt file.');
        }
      }

      // 2) Create interview
      const createRes = await createInterview({
        title,
        jobRole,
        sourceType,
        jobDescription: sourceType === 'jd' ? jobDescription : undefined,
        resumeUrl: undefined,
      });
      const interviewId = createRes.interview?._id;
      if (!interviewId) {
        throw new Error('Failed to create interview');
      }

      // 3) Generate questions using extracted text or JD
      await generateQuestions({
        interviewId,
        resumeText: sourceType === 'resume' ? finalResumeText : undefined,
        jobDescription: sourceType === 'jd' ? jobDescription : undefined,
      });

      // 4) Navigate to session
      navigate(`/mock-interview/session/${interviewId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Mock Interview</h1>
            <p className="text-sm text-gray-600">Create an interview and auto-generate questions.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Frontend Engineer Mock"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., React Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Type *</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sourceType"
                  value="resume"
                  checked={sourceType === 'resume'}
                  onChange={() => setSourceType('resume')}
                />
                Resume
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sourceType"
                  value="jd"
                  checked={sourceType === 'jd'}
                  onChange={() => setSourceType('jd')}
                />
                Job Description
              </label>
            </div>
          </div>

          {sourceType === 'resume' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume Text *</label>
                <textarea
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here (recommended)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload Resume (.txt file)</label>
                <input
                  type="file"
                  accept=".txt"
                  className="w-full text-sm text-gray-700"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-2">For best results, paste text above or upload a .txt file.</p>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white font-medium shadow-sm transition ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create & Generate Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMockInterview;
