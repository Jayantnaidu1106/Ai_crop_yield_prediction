import React, { useEffect, useState } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationsPanel from '../components/RecommendationsPanel';
import { Lightbulb, Filter, AlertTriangle, Info, AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { getAppliedRecommendations } from '../api/api';

export default function RecommendationsPage() {
  const { recommendations, summary, loading, total, fetchRecommendations, fetchSummary } = useRecommendations();
  const [filters, setFilters] = useState({ category: '', severity: '', crop: '', is_applied: '' });
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'history'
  const [appliedRecs, setAppliedRecs] = useState([]);
  const [appliedLoading, setAppliedLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations({ limit: 100 });
    fetchSummary();
    loadAppliedHistory();
  }, []);

  const loadAppliedHistory = async () => {
    setAppliedLoading(true);
    try {
      const res = await getAppliedRecommendations({ limit: 100 });
      setAppliedRecs(res.data.recommendations || []);
    } catch { /* ignore */ }
    finally { setAppliedLoading(false); }
  };

  const applyFilters = () => {
    const params = { limit: 100 };
    if (filters.category) params.category = filters.category;
    if (filters.severity) params.severity = filters.severity;
    if (filters.crop) params.crop = filters.crop;
    if (filters.is_applied) params.is_applied = filters.is_applied;
    fetchRecommendations(params);
  };

  const handleUpdate = () => {
    fetchRecommendations({ limit: 100 });
    fetchSummary();
    loadAppliedHistory();
  };

  const severityCounts = {};
  (summary?.bySeverity || []).forEach(s => { severityCounts[s._id] = s.count; });

  const categories = ['temperature', 'irrigation', 'fertilizer', 'pest_management', 'yield_analysis', 'seasonal', 'crop_specific', 'general'];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Recommendations</h1>
        <p>AI-powered farming advice based on your prediction data</p>
      </div>

      {/* Summary stats */}
      <div className="stats-grid stagger-children" style={{ marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-icon blue"><Info size={22} /></div>
          <div>
            <div className="stat-value">{severityCounts.info || 0}</div>
            <div className="stat-label">Info Recommendations</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><AlertTriangle size={22} /></div>
          <div>
            <div className="stat-value">{severityCounts.warning || 0}</div>
            <div className="stat-label">Warnings</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red-400)' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--red-400)' }}>{severityCounts.critical || 0}</div>
            <div className="stat-label">Critical Alerts</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div>
            <div className="stat-value">{summary?.applied || 0}</div>
            <div className="stat-label">Applied Actions</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rec-tabs" style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        <button
          className={`rec-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Lightbulb size={16} /> All Recommendations
        </button>
        <button
          className={`rec-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <ClipboardList size={16} /> Action History
          {appliedRecs.length > 0 && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem', marginLeft: 6 }}>
              {appliedRecs.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Filters */}
          <div className="filter-bar">
            <Filter size={16} color="var(--text-muted)" />
            <select className="form-select" value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
            <select className="form-select" value={filters.severity}
              onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select className="form-select" value={filters.is_applied}
              onChange={e => setFilters(f => ({ ...f, is_applied: e.target.value }))}>
              <option value="">All Status</option>
              <option value="true">Applied</option>
              <option value="false">Not Applied</option>
            </select>
            <input className="form-input" placeholder="Crop name" value={filters.crop}
              onChange={e => setFilters(f => ({ ...f, crop: e.target.value }))} />
            <button className="btn btn-primary" onClick={applyFilters} style={{ padding: '8px 16px' }}>Apply</button>
          </div>

          {/* Recommendations list */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">All Recommendations</h3>
              <span className="badge badge-purple">{total} total</span>
            </div>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <RecommendationsPanel recommendations={recommendations} onUpdate={handleUpdate} />
            )}
          </div>
        </>
      ) : (
        /* Action History Tab */
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={18} color="var(--green-400)" /> Action History
            </h3>
            <span className="badge badge-green">{appliedRecs.length} actions</span>
          </div>
          {appliedLoading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : appliedRecs.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={48} />
              <p>No actions recorded yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Mark recommendations as "Applied" to track your farming actions</p>
            </div>
          ) : (
            <div className="action-history-timeline">
              {appliedRecs.map((rec, i) => (
                <div key={rec._id} className="timeline-item animate-in"
                  style={{ animationDelay: `${i * 50}ms`, opacity: 0, animationFillMode: 'forwards' }}>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {rec.title}
                      </span>
                      <span className={`badge ${rec.severity === 'critical' ? 'badge-red' : rec.severity === 'warning' ? 'badge-amber' : 'badge-blue'}`}
                        style={{ fontSize: '0.65rem' }}>
                        {rec.severity}
                      </span>
                      {rec.outcome && rec.outcome !== 'pending' && (
                        <span className={`badge ${rec.outcome === 'improved' ? 'badge-green' : rec.outcome === 'worsened' ? 'badge-red' : 'badge-amber'}`}
                          style={{ fontSize: '0.65rem' }}>
                          {rec.outcome.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {rec.message}
                    </p>
                    {rec.applied_notes && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        📝 "{rec.applied_notes}"
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>🌾 {rec.crop}</span>
                      <span>📅 Applied: {new Date(rec.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
