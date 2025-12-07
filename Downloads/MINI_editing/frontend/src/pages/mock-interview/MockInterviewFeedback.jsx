import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFeedback } from '../../api/mockInterviewApi';

const MockInterviewFeedback = () => {
  const { id: interviewId } = useParams();

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const { feedback: fb } = await getFeedback(interviewId);
        if (isMounted) {
          setFeedback(fb);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.error || err.message || 'Failed to load feedback');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (interviewId) {
      fetchFeedback();
    } else {
      setError('Missing interview id');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  // Helper to get color based on score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBarColor = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Render metric card
  const MetricCard = ({ title, metric }) => {
    if (!metric || metric.score === undefined) return null;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(metric.score)}`}>
            {metric.score}/10
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full ${getScoreBarColor(metric.score)} transition-all`}
            style={{ width: `${metric.score * 10}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-700 leading-relaxed">{metric.feedback}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Feedback</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive AI-generated analysis of your performance</p>
          </div>
          <Link
            to="/mock-interview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 font-medium shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← Back to Interviews
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg bg-white border border-gray-200 p-8 shadow-sm text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your interview performance...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-6 py-4 shadow-sm">
            <strong className="font-semibold">Error: </strong>{error}
          </div>
        )}

        {!loading && !error && feedback && (
          <div className="space-y-6">
            {/* Overall Rating Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Overall Performance</h2>
                  <p className="text-indigo-100 text-lg">{feedback.summary || 'No summary available'}</p>
                </div>
                <div className="text-center bg-white bg-opacity-20 rounded-lg px-8 py-6 backdrop-blur-sm">
                  <div className="text-5xl font-bold">{feedback.rating ?? '?'}</div>
                  <div className="text-sm font-medium mt-1">out of 10</div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics Grid */}
            {feedback.metrics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Technical Knowledge" metric={feedback.metrics.technicalKnowledge} />
                  <MetricCard title="Communication Skills" metric={feedback.metrics.communicationSkills} />
                  <MetricCard title="Problem Solving" metric={feedback.metrics.problemSolvingApproach} />
                  <MetricCard title="Confidence" metric={feedback.metrics.confidence} />
                  <MetricCard title="Clarity of Answers" metric={feedback.metrics.clarityOfAnswers} />
                  <MetricCard title="Depth of Knowledge" metric={feedback.metrics.depthOfKnowledge} />
                </div>
              </div>
            )}

            {/* Overall Impression */}
            {feedback.overallImpression && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💼</span> Overall Impression
                </h2>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{feedback.overallImpression}</p>
              </div>
            )}

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✅</span> Strengths
                </h2>
                {Array.isArray(feedback.strengths) && feedback.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="text-green-600 font-bold mt-0.5">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No specific strengths recorded.</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span> Areas for Improvement
                </h2>
                {Array.isArray(feedback.weaknesses) && feedback.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {feedback.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="text-orange-600 font-bold mt-0.5">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No specific weaknesses identified.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {Array.isArray(feedback.recommendations) && feedback.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Recommendations for Next Time
                </h2>
                <ul className="space-y-3">
                  {feedback.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-800">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
              <p className="text-gray-700 mb-4">Ready to improve your skills?</p>
              <Link
                to="/mock-interview/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition-colors"
              >
                Start New Mock Interview
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewFeedback;
