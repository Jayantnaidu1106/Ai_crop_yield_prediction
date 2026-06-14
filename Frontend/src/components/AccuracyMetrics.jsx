import React from 'react';
import { Target, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default function AccuracyMetrics({ accuracy }) {
  if (!accuracy || accuracy.total_with_actuals === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <Target size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.3 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No accuracy data yet</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
          Update predictions with actual yields to track accuracy
        </p>
      </div>
    );
  }

  const { mean_absolute_error, mean_accuracy_percent, total_with_actuals } = accuracy;
  const accuracyColor = mean_accuracy_percent >= 85 ? 'var(--green-400)' :
    mean_accuracy_percent >= 70 ? 'var(--amber-400)' : 'var(--red-400)';

  return (
    <div className="card animate-in">
      <div className="card-header">
        <h3 className="card-title">Model Accuracy</h3>
        <span className="badge badge-blue">{total_with_actuals} tracked</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{
          padding: 20, borderRadius: 'var(--radius-md)',
          background: 'rgba(34,197,94,0.05)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: accuracyColor }}>
            {mean_accuracy_percent?.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Mean Accuracy
          </div>
          <div className="confidence-bar" style={{ marginTop: 8 }}>
            <div className={`confidence-bar-fill ${mean_accuracy_percent >= 85 ? 'high' : mean_accuracy_percent >= 70 ? 'medium' : 'low'}`}
              style={{ width: `${Math.min(100, mean_accuracy_percent)}%` }} />
          </div>
        </div>

        <div style={{
          padding: 20, borderRadius: 'var(--radius-md)',
          background: 'rgba(59,130,246,0.05)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--blue-400)' }}>
            {mean_absolute_error?.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Mean Absolute Error (t/ha)
          </div>
        </div>
      </div>
    </div>
  );
}
