import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom green marker for farm
const farmIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Component to recenter map
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 14, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function FarmLocationPicker({ lat, lng, onLocationChange }) {
  const [position, setPosition] = useState(lat && lng ? [lat, lng] : null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualLat, setManualLat] = useState(lat || '');
  const [manualLng, setManualLng] = useState(lng || '');
  const mapRef = useRef(null);

  // Default center — India center
  const defaultCenter = [22.5, 78.5];
  const center = position || defaultCenter;
  const zoom = position ? 14 : 5;

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
      setManualLat(lat);
      setManualLng(lng);
      reverseGeocode(lat, lng);
    }
  }, [lat, lng]);

  // Reverse geocode coordinates to address using Nominatim
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      setAddress('');
    }
  };

  // Handle location selection (from map click, GPS, or search)
  const handleLocationSelect = (latitude, longitude) => {
    const lat = parseFloat(latitude.toFixed(6));
    const lng = parseFloat(longitude.toFixed(6));
    setPosition([lat, lng]);
    setManualLat(lat);
    setManualLng(lng);
    reverseGeocode(lat, lng);
    onLocationChange(lat, lng);
  };

  // GPS auto-detect
  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      (err) => {
        alert(`GPS error: ${err.message}. Please enable location access.`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search address using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        handleLocationSelect(parseFloat(data[0].lat), parseFloat(data[0].lon));
      } else {
        alert('Location not found. Try a more specific address.');
      }
    } catch {
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Manual coordinate entry
  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }
    handleLocationSelect(lat, lng);
  };

  return (
    <div className="farm-location-picker">
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={handleGPS} disabled={gpsLoading}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          {gpsLoading ? <Loader2 size={16} className="spin" /> : <Navigation size={16} />}
          {gpsLoading ? 'Detecting...' : 'Auto-detect GPS'}
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="form-input"
          placeholder="Search address, village, city..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-secondary" onClick={handleSearch} disabled={searching}
          style={{ padding: '8px 14px' }}>
          {searching ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
        </button>
      </div>

      {/* Map */}
      <div className="map-container" style={{ height: 300, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)', marginBottom: 12 }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {position && <MapRecenter lat={position[0]} lng={position[1]} />}
          {position && <Marker position={position} icon={farmIcon} />}
        </MapContainer>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        📍 Click on the map to place your farm marker, or use GPS / search above
      </p>

      {/* Manual Coordinates */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.78rem' }}>Latitude</label>
          <input className="form-input" type="number" step="0.000001" placeholder="e.g. 26.8467"
            value={manualLat} onChange={e => setManualLat(e.target.value)}
            style={{ fontSize: '0.85rem' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.78rem' }}>Longitude</label>
          <input className="form-input" type="number" step="0.000001" placeholder="e.g. 80.9462"
            value={manualLng} onChange={e => setManualLng(e.target.value)}
            style={{ fontSize: '0.85rem' }} />
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleManualSubmit}
          style={{ padding: '10px 14px', marginBottom: 0 }}>
          <MapPin size={16} />
        </button>
      </div>

      {/* Resolved Address */}
      {address && (
        <div style={{
          marginTop: 12, padding: '10px 14px', background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem', color: 'var(--green-400)', display: 'flex', alignItems: 'flex-start', gap: 8
        }}>
          <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{address}</span>
        </div>
      )}

      <style>{`.spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}
