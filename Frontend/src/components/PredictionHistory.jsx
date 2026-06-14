import React from 'react';
import { History, Trash2, ExternalLink } from 'lucide-react';

export default function PredictionHistory({ predictions = [], onDelete }) {
  if (!predictions.length) {
    return (
      <div className="empty-state">
        <History size={48} />
        <p>No prediction history found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Season</th>
            <th>Year</th>
            <th>Yield (t/ha)</th>
            <th>Confidence</th>
            <th>Range</th>
            <th>Actual</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p, i) => {
            const confClass = p.confidence_level === 'high' ? 'badge-green' :
              p.confidence_level === 'medium' ? 'badge-amber' : 'badge-red';
            return (
              <tr key={p._id || i} style={{ animation: `fadeIn 0.3s ease ${i * 50}ms forwards`, opacity: 0 }}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {p.crop}
                </td>
                <td style={{ textTransform: 'capitalize' }}>{p.season}</td>
                <td>{p.crop_year}</td>
                <td style={{ fontWeight: 600, color: 'var(--green-400)' }}>
                  {p.yield_prediction?.toFixed(2)}
                </td>
                <td>
                  <span className={`badge ${confClass}`}>
                    {p.confidence_score?.toFixed(0)}% {p.confidence_level}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>
                  {p.lower_bound?.toFixed(2)} — {p.upper_bound?.toFixed(2)}
                </td>
                <td>
                  {p.actual_yield !== null && p.actual_yield !== undefined ? (
                    <span style={{ fontWeight: 600, color: 'var(--blue-400)' }}>
                      {p.actual_yield?.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: '2-digit'
                  }) : '—'}
                </td>
                <td>
                  {onDelete && p._id && (
                    <button className="btn btn-ghost" onClick={() => onDelete(p._id)}
                      style={{ padding: 6, color: 'var(--red-400)' }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
