import React, { useState, useEffect } from 'react';
import { Send, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const FIELD_HINTS = {
  area: 'Total cultivated area in hectares',
  production: 'Expected or historical production in tonnes',
  annual_rainfall: 'Annual rainfall in your region (mm)',
  fertilizer: 'Total fertilizer applied (kg per hectare)',
  pesticide: 'Total pesticide applied (kg per hectare)',
  temperature: 'Average temperature during growing season (°C)'
};

export default function PredictionForm({ apiInfo, onPredict, loading, compact = false }) {
  const [form, setForm] = useState({
    crop: '', crop_year: new Date().getFullYear(), season: '', state: '',
    area: '', production: '', annual_rainfall: '', fertilizer: '',
    pesticide: '', temperature: ''
  });

  const crops = apiInfo?.crop_mapping ? Object.keys(apiInfo.crop_mapping) : [];
  const seasons = apiInfo?.season_mapping ? Object.keys(apiInfo.season_mapping) : [];
  const states = apiInfo?.state_mapping ? Object.keys(apiInfo.state_mapping) : [];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.crop || !form.season || !form.state) {
      toast.error('Please select crop, season, and state');
      return;
    }
    try {
      await onPredict({
        ...form,
        crop_year: Number(form.crop_year),
        area: Number(form.area) || 0,
        production: Number(form.production) || 0,
        annual_rainfall: Number(form.annual_rainfall) || 0,
        fertilizer: Number(form.fertilizer) || 0,
        pesticide: Number(form.pesticide) || 0,
        temperature: Number(form.temperature) || 25
      });
      toast.success('Prediction generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Prediction failed');
    }
  };

  const FieldLabel = ({ label, hint }) => (
    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {label}
      {hint && (
        <span title={hint} style={{ cursor: 'help', color: 'var(--text-muted)' }}>
          <Info size={14} />
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Selectors row */}
      <div className="form-grid" style={compact ? { gridTemplateColumns: '1fr 1fr 1fr' } : undefined}>
        <div className="form-group">
          <FieldLabel label="Crop *" />
          <select className="form-select" value={form.crop} onChange={e => handleChange('crop', e.target.value)} required>
            <option value="">Select Crop</option>
            {crops.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <FieldLabel label="Season *" />
          <select className="form-select" value={form.season} onChange={e => handleChange('season', e.target.value)} required>
            <option value="">Select Season</option>
            {seasons.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <FieldLabel label="State *" />
          <select className="form-select" value={form.state} onChange={e => handleChange('state', e.target.value)} required>
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Numeric inputs */}
      {!compact && (
        <>
          <div className="form-grid">
            <div className="form-group">
              <FieldLabel label="Crop Year" />
              <input className="form-input" type="number" value={form.crop_year}
                onChange={e => handleChange('crop_year', e.target.value)} />
            </div>
            <div className="form-group">
              <FieldLabel label="Area (hectares)" hint={FIELD_HINTS.area} />
              <input className="form-input" type="number" step="0.01" placeholder="e.g. 2.5"
                value={form.area} onChange={e => handleChange('area', e.target.value)} />
            </div>
            <div className="form-group">
              <FieldLabel label="Production (tonnes)" hint={FIELD_HINTS.production} />
              <input className="form-input" type="number" step="0.01" placeholder="e.g. 5.0"
                value={form.production} onChange={e => handleChange('production', e.target.value)} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <FieldLabel label="Annual Rainfall (mm)" hint={FIELD_HINTS.annual_rainfall} />
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 1200"
                value={form.annual_rainfall} onChange={e => handleChange('annual_rainfall', e.target.value)} />
            </div>
            <div className="form-group">
              <FieldLabel label="Fertilizer (kg/ha)" hint={FIELD_HINTS.fertilizer} />
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 80"
                value={form.fertilizer} onChange={e => handleChange('fertilizer', e.target.value)} />
            </div>
            <div className="form-group">
              <FieldLabel label="Pesticide (kg/ha)" hint={FIELD_HINTS.pesticide} />
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 2.5"
                value={form.pesticide} onChange={e => handleChange('pesticide', e.target.value)} />
            </div>
          </div>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="form-group">
              <FieldLabel label="Temperature (°C)" hint={FIELD_HINTS.temperature} />
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 28"
                value={form.temperature} onChange={e => handleChange('temperature', e.target.value)} />
            </div>
          </div>
        </>
      )}

      {compact && (
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <div className="form-group">
            <FieldLabel label="Area (ha)" />
            <input className="form-input" type="number" step="0.01" placeholder="2.5"
              value={form.area} onChange={e => handleChange('area', e.target.value)} />
          </div>
          <div className="form-group">
            <FieldLabel label="Rainfall (mm)" />
            <input className="form-input" type="number" step="0.1" placeholder="1200"
              value={form.annual_rainfall} onChange={e => handleChange('annual_rainfall', e.target.value)} />
          </div>
          <div className="form-group">
            <FieldLabel label="Fertilizer" />
            <input className="form-input" type="number" step="0.1" placeholder="80"
              value={form.fertilizer} onChange={e => handleChange('fertilizer', e.target.value)} />
          </div>
          <div className="form-group">
            <FieldLabel label="Temp (°C)" />
            <input className="form-input" type="number" step="0.1" placeholder="28"
              value={form.temperature} onChange={e => handleChange('temperature', e.target.value)} />
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}
        style={{ marginTop: 8 }}>
        {loading ? <><Loader2 size={18} className="spin" /> Predicting...</> : <><Send size={18} /> Predict Yield</>}
      </button>

      <style>{`.spin { animation: spin 0.8s linear infinite; }`}</style>
    </form>
  );
}
