import React, { useEffect, useState } from 'react';
import { usePredictions } from '../hooks/usePredictions';
import PredictionHistory from '../components/PredictionHistory';
import AccuracyMetrics from '../components/AccuracyMetrics';
import { YieldTrendChart } from '../components/PredictionChart';
import { deletePrediction, exportPredictions } from '../api/api';
import { Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function YieldHistoryPage() {
  const { predictions, accuracy, loading, total, fetchHistory, fetchAccuracy } = usePredictions();
  const [filters, setFilters] = useState({ crop: '', season: '', start_date: '', end_date: '' });

  useEffect(() => {
    fetchHistory();
    fetchAccuracy();
  }, []);

  const applyFilters = () => {
    const params = {};
    if (filters.crop) params.crop = filters.crop;
    if (filters.season) params.season = filters.season;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    fetchHistory(params);
  };

  const handleDelete = async (id) => {
    try {
      await deletePrediction(id);
      toast.success('Prediction deleted');
      fetchHistory();
    } catch { toast.error('Delete failed'); }
  };

  const handleExport = async (format) => {
    try {
      const res = await exportPredictions({ format, ...filters });
      if (format === 'csv') {
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = 'predictions_export.csv'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = 'predictions_export.json'; a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  const trendData = predictions.map(p => ({
    date: p.created_at, yield: p.yield_prediction, confidence: p.confidence_score
  })).reverse();

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Yield History</h1>
          <p>Historical predictions, accuracy tracking, and data export</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            <Download size={16} /> CSV
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('json')}>
            <Download size={16} /> JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Filter size={16} color="var(--text-muted)" />
        <input className="form-input" placeholder="Crop name" value={filters.crop}
          onChange={e => setFilters(f => ({ ...f, crop: e.target.value }))} />
        <select className="form-select" value={filters.season}
          onChange={e => setFilters(f => ({ ...f, season: e.target.value }))}>
          <option value="">All Seasons</option>
          {['kharif','rabi','summer','autumn','winter','whole year'].map(s =>
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          )}
        </select>
        <input className="form-input" type="date" value={filters.start_date}
          onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))}
          style={{ maxWidth: 160 }} />
        <input className="form-input" type="date" value={filters.end_date}
          onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))}
          style={{ maxWidth: 160 }} />
        <button className="btn btn-primary" onClick={applyFilters} style={{ padding: '8px 16px' }}>
          Apply
        </button>
      </div>

      {/* Accuracy */}
      <div style={{ marginBottom: 24 }}>
        <AccuracyMetrics accuracy={accuracy} />
      </div>

      {/* Trend */}
      {trendData.length > 1 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">Prediction Trend</h3>
            <span className="badge badge-green">{total} total</span>
          </div>
          <YieldTrendChart data={trendData} />
        </div>
      )}

      {/* History table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Prediction Records</h3>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <PredictionHistory predictions={predictions} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
