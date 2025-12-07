import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyInterviews } from '../api/mockInterviewApi';

const statusBadge = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    ready: 'bg-green-100 text-green-800 border border-green-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200'
  };
  return map[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
};

const MockInterviewDashboard = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getMyInterviews();
        setInterviews(res.interviews || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderActions = (interview) => {
    const isReady = interview.status === 'ready';
    const isCompleted = interview.status === 'completed';

    return (
      <div className="flex gap-2 flex-wrap">
        <button
          className={`px-3 py-1 rounded text-sm font-medium text-white transition ${
            isReady ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!isReady}
          onClick={() => isReady && navigate(`/mock-interview/session/${interview._id}`)}
        >
          Start Interview
        </button>
        <button
          className={`px-3 py-1 rounded text-sm font-medium text-white transition ${
            isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!isCompleted}
          onClick={() => isCompleted && navigate(`/mock-interview/feedback/${interview._id}`)}
        >
          View Feedback
        </button>
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mock Interview Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your AI-powered mock interviews.</p>
          </div>
          <Link
            to="/mock-interview/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
          >
            <i className="ri-add-line"></i>
            New Interview
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No interviews yet</div>
            <p className="text-sm mb-4">Create your first mock interview to get started.</p>
            <Link
              to="/mock-interview/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
            >
              <i className="ri-add-line"></i>
              New Interview
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interviews.map((interview) => (
                  <tr key={interview._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{interview.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{interview.jobRole || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(interview.status)}`}>
                        {interview.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(interview.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{renderActions(interview)}</td>
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

export default MockInterviewDashboard;
