import React, { useState } from 'react';
import { FlaskConical, Plus, X, Play, Loader2 } from 'lucide-react';
import { ScenarioChart } from './PredictionChart';
import toast from 'react-hot-toast';

export default function ScenarioAnalysis({ apiInfo, onAnalyze, loading }) {
  const [baseParams, setBaseParams] = useState({
    crop: '', crop_year: new Date().getFullYear(), season: '', state: '',
    area: 1, production: 3, annual_rainfall: 1200, fertilizer: 80,
    pesticide: 2.5, temperature: 28
  });
  const [scenarios, setScenarios] = useState([
    { name: 'More Fertilizer', overrides: { fertilizer: 120 } },
    { name: 'Higher Rainfall', overrides: { annual_rainfall: 1500 } }
  ]);
  const [results, setResults] = useState(null);

  const crops = apiInfo?.crop_mapping ? Object.keys(apiInfo.crop_mapping) : [];
  const seasons = apiInfo?.season_mapping ? Object.keys(apiInfo.season_mapping) : [];
  const states = apiInfo?.state_mapping ? Object.keys(apiInfo.state_mapping) : [];

  const addScenario = () => {
    setScenarios(prev => [...prev, { name: `Scenario ${prev.length + 1}`, overrides: {} }]);
  };

  const removeScenario = (index) => {
    setScenarios(prev => prev.filter((_, i) => i !== index));
  };

  const updateScenario = (index, field, value) => {
    setScenarios(prev => {
      const updated = [...prev];
      if (field === 'name') {
        updated[index] = { ...updated[index], name: value };
      } else {
        updated[index] = {
          ...updated[index],
          overrides: { ...updated[index].overrides, [field]: Number(value) }
        };
      }
      return updated;
    });
  };

  const runAnalysis = async () => {
    if (!baseParams.crop || !baseParams.season || !baseParams.state) {
      toast.error('Fill in base crop, season, and state');
      return;
    }
    try {
      const data = await onAnalyze(baseParams, scenarios);
      setResults(data.scenarios || []);
      toast.success('Scenario analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={20} color="var(--purple-400)" />
            What-If Scenario Analysis
          </h3>
          <p className="card-subtitle">Compare predictions with different inputs</p>
        </div>
      </div>

      {/* Base parameters */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>
          Base Parameters
        </h4>
        <div className="form-grid">
          <select className="form-select" value={baseParams.crop}
            onChange={e => setBaseParams(p => ({ ...p, crop: e.target.value }))}>
            <option value="">Crop</option>
            {crops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select" value={baseParams.season}
            onChange={e => setBaseParams(p => ({ ...p, season: e.target.value }))}>
            <option value="">Season</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" value={baseParams.state}
            onChange={e => setBaseParams(p => ({ ...p, state: e.target.value }))}>
            <option value="">State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="form-input" type="number" placeholder="Rainfall (mm)"
            value={baseParams.annual_rainfall}
            onChange={e => setBaseParams(p => ({ ...p, annual_rainfall: Number(e.target.value) }))} />
          <input className="form-input" type="number" placeholder="Temp °C"
            value={baseParams.temperature}
            onChange={e => setBaseParams(p => ({ ...p, temperature: Number(e.target.value) }))} />
        </div>
      </div>

      {/* Scenarios */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Scenarios to Compare
          </h4>
          <button className="btn btn-secondary" onClick={addScenario}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Plus size={14} /> Add
          </button>
        </div>

        {scenarios.map((scenario, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8,
            padding: '10px 14px', background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)',
            flexWrap: 'wrap'
          }}>
            <input className="form-input" placeholder="Name" value={scenario.name}
              onChange={e => updateScenario(i, 'name', e.target.value)}
              style={{ maxWidth: 150, padding: '6px 10px' }} />
            <input className="form-input" type="number" placeholder="Fertilizer"
              value={scenario.overrides.fertilizer || ''}
              onChange={e => updateScenario(i, 'fertilizer', e.target.value)}
              style={{ maxWidth: 110, padding: '6px 10px' }} />
            <input className="form-input" type="number" placeholder="Rainfall"
              value={scenario.overrides.annual_rainfall || ''}
              onChange={e => updateScenario(i, 'annual_rainfall', e.target.value)}
              style={{ maxWidth: 110, padding: '6px 10px' }} />
            <input className="form-input" type="number" placeholder="Temp"
              value={scenario.overrides.temperature || ''}
              onChange={e => updateScenario(i, 'temperature', e.target.value)}
              style={{ maxWidth: 90, padding: '6px 10px' }} />
            <button className="btn btn-ghost" onClick={() => removeScenario(i)}
              style={{ padding: 4 }}>
              <X size={16} color="var(--red-400)" />
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-full" onClick={runAnalysis} disabled={loading}>
        {loading ? (
          <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Running...</>
        ) : (
          <><Play size={18} /> Run Analysis</>
        )}
      </button>

      {/* Results */}
      {results && results.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
            Results
          </h4>
          <ScenarioChart data={results} />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginTop: 16
          }}>
            {results.filter(r => !r.error).map((r, i) => (
              <div key={i} style={{
                padding: 16, borderRadius: 'var(--radius-md)', textAlign: 'center',
                background: i === 0 ? 'rgba(34,197,94,0.08)' : 'var(--bg-glass)',
                border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.2)' : 'var(--border-glass)'}`
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  {r.scenario_name}
                </div>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 700,
                  color: i === 0 ? 'var(--green-400)' : 'var(--blue-400)'
                }}>
                  {r.yield_prediction?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>t/ha</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
