import React, { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Wheat, Ruler, Save, Loader2, Bell,
  Shield, Calendar, Hash, X, Plus, Tractor
} from 'lucide-react';
import toast from 'react-hot-toast';
import FarmLocationPicker from '../components/FarmLocationPicker';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const COMMON_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Groundnut',
  'Mustard', 'Potato', 'Onion', 'Tomato', 'Jowar', 'Bajra', 'Ragi',
  'Barley', 'Gram', 'Tur', 'Urad', 'Moong', 'Sunflower', 'Jute', 'Tea', 'Coffee'
];

export default function ProfilePage({ user, onUpdateUser }) {
  const [form, setForm] = useState({
    name: '',
    farm_name: '',
    farm_location: '',
    farm_state: '',
    farm_area_acres: '',
    farm_lat: null,
    farm_lng: null,
    preferred_crops: [],
    sms_alerts_enabled: false
  });
  const [saving, setSaving] = useState(false);
  const [cropInput, setCropInput] = useState('');
  const [showCropSuggestions, setShowCropSuggestions] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        farm_name: user.farm_name || '',
        farm_location: user.farm_location || '',
        farm_state: user.farm_state || '',
        farm_area_acres: user.farm_area_acres || '',
        farm_lat: user.farm_lat || null,
        farm_lng: user.farm_lng || null,
        preferred_crops: user.preferred_crops || [],
        sms_alerts_enabled: user.sms_alerts_enabled || false
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateUser({
        ...form,
        farm_area_acres: form.farm_area_acres ? Number(form.farm_area_acres) : null
      });
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addCrop = (crop) => {
    const c = crop.trim();
    if (c && !form.preferred_crops.includes(c)) {
      setForm(f => ({ ...f, preferred_crops: [...f.preferred_crops, c] }));
    }
    setCropInput('');
    setShowCropSuggestions(false);
  };

  const removeCrop = (crop) => {
    setForm(f => ({ ...f, preferred_crops: f.preferred_crops.filter(c => c !== crop) }));
  };

  const filteredSuggestions = COMMON_CROPS.filter(
    c => c.toLowerCase().includes(cropInput.toLowerCase()) && !form.preferred_crops.includes(c)
  );

  const handleLocationChange = (lat, lng) => {
    setForm(f => ({ ...f, farm_lat: lat, farm_lng: lng }));
  };

  const maskPhone = (phone) => {
    if (!phone) return '—';
    return phone.length > 4 ? '•'.repeat(phone.length - 4) + phone.slice(-4) : phone;
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your farm profile and application preferences</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column — Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Profile Header Card */}
          <div className="card profile-hero-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="profile-avatar-lg">
                {(form.name || user?.phone_number || 'F').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>
                  {form.name || 'Farmer'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Phone size={14} />
                  <span>{maskPhone(user?.phone_number)}</span>
                </div>
                {form.farm_location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    <MapPin size={14} />
                    <span>{form.farm_location}{form.farm_state ? `, ${form.farm_state}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="var(--blue-400)" /> Personal Info
              </h3>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Enter your name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={user?.phone_number || ''} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p className="form-hint">Phone number cannot be changed</p>
            </div>
          </div>

          {/* Farm Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tractor size={18} color="var(--green-400)" /> Farm Details
              </h3>
            </div>
            <div className="form-group">
              <label className="form-label">Farm Name</label>
              <input className="form-input" placeholder="e.g. Green Valley Farm" value={form.farm_name}
                onChange={e => setForm(f => ({ ...f, farm_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label"><MapPin size={14} style={{ marginRight: 4 }} />Farm Location</label>
              <input className="form-input" placeholder="Village/City, District" value={form.farm_location}
                onChange={e => setForm(f => ({ ...f, farm_location: e.target.value }))} />
              <p className="form-hint">Enter your village or city with district name</p>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-select" value={form.farm_state}
                  onChange={e => setForm(f => ({ ...f, farm_state: e.target.value }))}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><Ruler size={14} style={{ marginRight: 4 }} />Farm Area (Acres)</label>
                <input className="form-input" type="number" placeholder="e.g. 5.5" value={form.farm_area_acres}
                  onChange={e => setForm(f => ({ ...f, farm_area_acres: e.target.value }))}
                  min="0" step="0.1" />
              </div>
            </div>
          </div>

          {/* Farm Location Map */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--cyan-400)" /> Farm GPS Location
              </h3>
              {form.farm_lat && form.farm_lng && (
                <span className="badge badge-green">
                  {form.farm_lat.toFixed(4)}, {form.farm_lng.toFixed(4)}
                </span>
              )}
            </div>
            <FarmLocationPicker
              lat={form.farm_lat}
              lng={form.farm_lng}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>

        {/* Right Column — Crops, Settings, Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Preferred Crops */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wheat size={18} color="var(--amber-400)" /> Preferred Crops
              </h3>
              <span className="badge badge-amber">{form.preferred_crops.length}</span>
            </div>

            {/* Crop Tags */}
            <div className="crop-tags">
              {form.preferred_crops.map(crop => (
                <span key={crop} className="crop-tag">
                  {crop}
                  <button onClick={() => removeCrop(crop)} className="crop-tag-remove" aria-label={`Remove ${crop}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {form.preferred_crops.length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No crops added yet</span>
              )}
            </div>

            {/* Add Crop Input */}
            <div style={{ position: 'relative', marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Type a crop name..."
                  value={cropInput}
                  onChange={e => { setCropInput(e.target.value); setShowCropSuggestions(true); }}
                  onFocus={() => setShowCropSuggestions(true)}
                  onKeyDown={e => { if (e.key === 'Enter' && cropInput.trim()) { e.preventDefault(); addCrop(cropInput); } }}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={() => addCrop(cropInput)}
                  disabled={!cropInput.trim()} style={{ padding: '8px 14px' }}>
                  <Plus size={16} />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showCropSuggestions && cropInput && filteredSuggestions.length > 0 && (
                <div className="crop-suggestions">
                  {filteredSuggestions.slice(0, 6).map(crop => (
                    <button key={crop} className="crop-suggestion-item" onClick={() => addCrop(crop)}>
                      <Wheat size={14} /> {crop}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={18} color="var(--purple-400)" /> Notifications
              </h3>
            </div>
            <div className="settings-row">
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>SMS Weather Alerts</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Receive rain & severe weather alerts via SMS to your phone
                </p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={form.sms_alerts_enabled}
                  onChange={e => setForm(f => ({ ...f, sms_alerts_enabled: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </div>
            {form.sms_alerts_enabled && (!form.farm_lat || !form.farm_lng) && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--amber-400)'
              }}>
                ⚠️ Set your farm GPS location above to receive location-based weather alerts
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color="var(--cyan-400)" /> Account Info
              </h3>
            </div>
            <div className="settings-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={16} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Member Since</span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{memberSince}</span>
            </div>
            <div className="settings-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Hash size={16} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Phone Number</span>
              </div>
              <span className="badge badge-green">{user?.verified ? 'Verified' : 'Unverified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="save-bar">
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}
          style={{ minWidth: 200 }}>
          {saving ? <Loader2 size={18} className="spin" /> : <><Save size={18} /> Save Profile</>}
        </button>
      </div>

      <style>{`.spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}
