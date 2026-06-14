import React, { useState } from 'react';
import {
  Thermometer, Droplets, FlaskConical, Bug, TrendingUp, TrendingDown,
  Calendar, Sprout, Microscope, ShieldCheck, ShieldAlert, CloudRain,
  CloudSun, Map, Info, Check, MessageSquare, ThumbsUp, Minus, ThumbsDown
} from 'lucide-react';
import { applyRecommendation, recordOutcome } from '../api/api';
import toast from 'react-hot-toast';

const ICON_MAP = {
  'thermometer-snowflake': Thermometer,
  'thermometer-sun': Thermometer,
  'thermometer': Thermometer,
  'droplets': Droplets,
  'cloud-rain': CloudRain,
  'cloud-sun': CloudSun,
  'flask-conical': FlaskConical,
  'bug': Bug,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'calendar': Calendar,
  'sprout': Sprout,
  'microscope': Microscope,
  'map': Map,
  'info': Info,
};

const SEVERITY_STYLES = {
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', color: 'var(--blue-400)' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: 'var(--amber-400)' },
  critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: 'var(--red-400)' },
};

const OUTCOME_CONFIG = {
  improved: { icon: ThumbsUp, label: 'Improved', color: 'var(--green-400)', bg: 'rgba(34,197,94,0.12)' },
  no_change: { icon: Minus, label: 'No Change', color: 'var(--amber-400)', bg: 'rgba(245,158,11,0.12)' },
  worsened: { icon: ThumbsDown, label: 'Worsened', color: 'var(--red-400)', bg: 'rgba(239,68,68,0.12)' },
};

export default function RecommendationsPanel({ recommendations = [], compact = false, onUpdate }) {
  const [applyingId, setApplyingId] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applyValue, setApplyValue] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  if (!recommendations.length) {
    return (
      <div className="empty-state">
        <Sprout size={48} />
        <p>No recommendations available</p>
        <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Make a prediction to get farming advice</p>
      </div>
    );
  }

  const handleApply = async (id) => {
    setLoadingId(id);
    try {
      const res = await applyRecommendation(id, applyNotes, applyValue);
      
      if (res.data?.newPrediction) {
        toast.success(`Action applied! Updated Prediction: ${res.data.newPrediction.yield_prediction.toFixed(2)} t/ha`);
      } else {
        toast.success('Recommendation marked as applied!');
      }
      
      setApplyingId(null);
      setApplyNotes('');
      setApplyValue('');
      if (onUpdate) onUpdate();
    } catch {
      toast.error('Failed to apply');
    } finally {
      setLoadingId(null);
    }
  };

  const handleOutcome = async (id, outcome) => {
    setLoadingId(id);
    try {
      await recordOutcome(id, outcome);
      toast.success('Outcome recorded!');
      if (onUpdate) onUpdate();
    } catch {
      toast.error('Failed to record outcome');
    } finally {
      setLoadingId(null);
    }
  };

  // Sort by severity (critical first)
  const sorted = [...recommendations].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });

  const items = compact ? sorted.slice(0, 5) : sorted;

  // Categories that can trigger a numeric recalculation
  const isQuantitative = (cat) => ['fertilizer', 'irrigation', 'pest_management', 'temperature'].includes(cat);
  const getUnit = (cat) => {
    if (cat === 'fertilizer' || cat === 'pest_management') return 'kg/ha';
    if (cat === 'irrigation') return 'mm';
    if (cat === 'temperature') return '°C';
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((rec, i) => {
        const IconComponent = ICON_MAP[rec.icon] || Info;
        const style = SEVERITY_STYLES[rec.severity] || SEVERITY_STYLES.info;
        const isApplying = applyingId === rec._id;
        const isLoading = loadingId === rec._id;
        const quantitative = isQuantitative(rec.category);

        return (
          <div key={rec._id || i} className="animate-in" style={{
            background: rec.is_applied ? 'rgba(34,197,94,0.05)' : style.bg,
            border: `1px solid ${rec.is_applied ? 'rgba(34,197,94,0.2)' : style.border}`,
            borderRadius: 'var(--radius-md)', padding: '16px 20px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
            animationDelay: `${i * 60}ms`, opacity: 0,
            animationFillMode: 'forwards'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: style.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: `1px solid ${style.border}`
            }}>
              <IconComponent size={18} color={style.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {rec.title}
                </span>
                <span className={`badge ${rec.severity === 'critical' ? 'badge-red' : rec.severity === 'warning' ? 'badge-amber' : 'badge-blue'}`}>
                  {rec.severity}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                  {rec.category?.replace('_', ' ')}
                </span>
                {rec.is_applied && (
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                    <Check size={10} /> Applied
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                {rec.message}
              </p>
              {!compact && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Action:</strong> {rec.action}
                </p>
              )}

              {/* Applied info */}
              {rec.is_applied && rec.applied_at && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  ✅ Applied on {new Date(rec.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {rec.applied_notes && (
                    <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>
                      — "{rec.applied_notes}"
                    </span>
                  )}
                </div>
              )}

              {/* Outcome buttons for applied recommendations */}
              {rec.is_applied && !compact && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>
                    Outcome:
                  </span>
                  {Object.entries(OUTCOME_CONFIG).map(([key, cfg]) => {
                    const OutcomeIcon = cfg.icon;
                    const isSelected = rec.outcome === key;
                    return (
                      <button
                        key={key}
                        className="outcome-btn"
                        onClick={() => handleOutcome(rec._id, key)}
                        disabled={isLoading}
                        style={{
                          background: isSelected ? cfg.bg : 'transparent',
                          color: isSelected ? cfg.color : 'var(--text-muted)',
                          border: `1px solid ${isSelected ? cfg.color : 'var(--border-glass)'}`,
                          borderRadius: 16, padding: '4px 10px',
                          fontSize: '0.75rem', fontWeight: 500,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <OutcomeIcon size={12} /> {cfg.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Apply button / form */}
              {!rec.is_applied && !compact && (
                <div style={{ marginTop: 6 }}>
                  {isApplying ? (
                    <div className="apply-form" style={{
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                      animation: 'fadeIn 0.2s ease', flexDirection: 'column'
                    }}>
                      {quantitative && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 120 }}>
                            New {rec.category.replace('_', ' ')}:
                          </span>
                          <input
                            type="number"
                            className="form-input"
                            placeholder={`Value (${getUnit(rec.category)})`}
                            value={applyValue}
                            onChange={e => setApplyValue(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                        <input
                          className="form-input"
                          placeholder="What did you do? (optional notes)"
                          value={applyNotes}
                          onChange={e => setApplyNotes(e.target.value)}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                          onKeyDown={e => { if (e.key === 'Enter') handleApply(rec._id); }}
                        />
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          onClick={() => handleApply(rec._id)}
                          disabled={isLoading}
                        >
                          <Check size={14} /> Confirm
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                          onClick={() => { setApplyingId(null); setApplyNotes(''); setApplyValue(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="apply-btn"
                      onClick={() => setApplyingId(rec._id)}
                      style={{
                        background: 'none', border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)', padding: '5px 12px',
                        color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Check size={13} /> Mark as Applied
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
