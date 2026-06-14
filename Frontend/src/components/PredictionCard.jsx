import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  if (!prediction) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <TrendingUp size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.3 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No predictions yet</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
          Make your first prediction to see results here
        </p>
      </div>
    );
  }

  const p = prediction.prediction || prediction;
  const confidenceColor = p.confidence_level === 'high' ? 'var(--green-400)' :
    p.confidence_level === 'medium' ? 'var(--amber-400)' : 'var(--red-400)';
  const confidenceBg = p.confidence_level === 'high' ? 'rgba(34,197,94,0.1)' :
    p.confidence_level === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <div className="card animate-in" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'var(--gradient-green)'
      }} />

      <div className="card-header">
        <div>
          <h3 className="card-title">Latest Prediction</h3>
          <p className="card-subtitle">{p.crop} — {p.season} {p.crop_year}</p>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: 'rgba(34,197,94,0.15)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <TrendingUp size={22} color="var(--green-400)" />
        </div>
      </div>

      {/* Yield value */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1,
          background: 'var(--gradient-green)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {p.yield_prediction?.toFixed(2)}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>tonnes / hectare</span>
      </div>

      {/* Confidence */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: confidenceBg
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: confidenceColor }}>
              {p.confidence_score?.toFixed(1)}%
            </span>
            <span style={{ fontSize: '0.75rem', color: confidenceColor, textTransform: 'uppercase', fontWeight: 600 }}>
              {p.confidence_level}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          <div>Range: {p.lower_bound?.toFixed(2)} — {p.upper_bound?.toFixed(2)}</div>
          <div>± {p.std_deviation?.toFixed(3)}</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="confidence-bar" style={{ marginTop: 12 }}>
        <div
          className={`confidence-bar-fill ${p.confidence_level}`}
          style={{ width: `${Math.min(100, p.confidence_score || 0)}%` }}
        />
      </div>
    </div>
  );
}
