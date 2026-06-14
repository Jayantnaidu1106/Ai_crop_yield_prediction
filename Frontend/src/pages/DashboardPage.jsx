import React, { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Target, Lightbulb, Cpu,
  Cloud, Droplets, Wind, Thermometer, AlertTriangle, MapPin, Navigation
} from 'lucide-react';
import { getDashboardSummary, getCurrentWeather, getWeatherForecast } from '../api/api';
import PredictionCard from '../components/PredictionCard';
import { YieldTrendChart, CropComparisonChart } from '../components/PredictionChart';
import RecommendationsPanel from '../components/RecommendationsPanel';
import { NavLink } from 'react-router-dom';

const WEATHER_ICONS = {
  'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
  'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Fog': '🌫️',
  'Haze': '🌫️', 'Smoke': '🌫️', 'Dust': '🌪️', 'Unknown': '🌡️'
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [weatherError, setWeatherError] = useState(null);

  useEffect(() => {
    loadDashboard();
    loadWeather();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboardSummary();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally { setLoading(false); }
  };

  const loadWeather = async () => {
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        getCurrentWeather(),
        getWeatherForecast()
      ]);
      setWeather(weatherRes.data);
      setWeatherAlerts(forecastRes.data.alerts || []);
    } catch (err) {
      setWeatherError(err.response?.data?.needs_location ? 'needs_location' : 'error');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const stats = [
    { label: 'Total Predictions', value: data?.totalPredictions || 0, icon: BarChart3, color: 'green' },
    { label: 'Avg Yield', value: `${data?.avgYield?.toFixed(1) || 0} t/ha`, icon: TrendingUp, color: 'blue' },
    { label: 'Avg Confidence', value: `${data?.avgConfidence?.toFixed(0) || 0}%`, icon: Target, color: 'amber' },
    { label: 'ML Service', value: data?.mlServiceStatus === 'healthy' ? 'Online' : 'Offline', icon: Cpu, color: 'purple' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your crop yield predictions and farming insights</p>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger-children">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weather Widget */}
      <div className="weather-widget card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cloud size={18} color="var(--cyan-400)" /> Farm Weather
          </h3>
          {weather?.farm?.location && (
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              <MapPin size={10} /> {weather.farm.location}{weather.farm.state ? `, ${weather.farm.state}` : ''}
            </span>
          )}
        </div>

        {weatherError === 'needs_location' ? (
          <div style={{
            padding: '24px', textAlign: 'center', color: 'var(--text-muted)'
          }}>
            <Navigation size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ marginBottom: 8 }}>Set your farm location to see local weather</p>
            <NavLink to="/settings" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
              <MapPin size={14} /> Set Farm Location
            </NavLink>
          </div>
        ) : weatherError ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Weather data unavailable. Check your OpenWeatherMap API key.
          </div>
        ) : weather ? (
          <div>
            {/* Current weather */}
            <div className="weather-current">
              <div className="weather-main">
                <span className="weather-emoji">
                  {WEATHER_ICONS[weather.weather?.weather] || '🌡️'}
                </span>
                <div>
                  <div className="weather-temp">{weather.weather?.temperature}°C</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {weather.weather?.weather_description}
                  </div>
                </div>
              </div>
              <div className="weather-details">
                <div className="weather-detail">
                  <Thermometer size={14} color="var(--amber-400)" />
                  <span>Feels like {weather.weather?.feels_like}°C</span>
                </div>
                <div className="weather-detail">
                  <Droplets size={14} color="var(--blue-400)" />
                  <span>Humidity {weather.weather?.humidity}%</span>
                </div>
                <div className="weather-detail">
                  <Wind size={14} color="var(--text-muted)" />
                  <span>Wind {weather.weather?.wind_speed} m/s</span>
                </div>
                <div className="weather-detail">
                  <Cloud size={14} color="var(--text-muted)" />
                  <span>Clouds {weather.weather?.clouds}%</span>
                </div>
              </div>
            </div>

            {/* Weather Alerts */}
            {weatherAlerts.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color="var(--amber-400)" /> Upcoming Alerts
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {weatherAlerts.slice(0, 3).map((alert, i) => (
                    <div key={i} className={`weather-alert weather-alert-${alert.severity}`}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>
                        {alert.message}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {alert.details}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        ⚠️ {alert.precautions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="loading-spinner" style={{ padding: 30 }}><div className="spinner" /></div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Latest prediction */}
        <PredictionCard prediction={data?.latestPrediction} />

        {/* Trend chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Yield Trend</h3>
            <span className="badge badge-green">{data?.predictionTrend?.length || 0} records</span>
          </div>
          {data?.predictionTrend?.length > 0 ? (
            <YieldTrendChart data={data.predictionTrend} />
          ) : (
            <div className="empty-state"><p>No trend data yet</p></div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Crop comparison */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Crops by Yield</h3>
          </div>
          {data?.cropStats?.length > 0 ? (
            <CropComparisonChart data={data.cropStats} />
          ) : (
            <div className="empty-state"><p>Make predictions for multiple crops to compare</p></div>
          )}
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Lightbulb size={18} color="var(--amber-400)" style={{ marginRight: 6 }} />
              Recent Recommendations
            </h3>
            {data?.unreadRecs > 0 && <span className="badge badge-amber">{data.unreadRecs} new</span>}
          </div>
          <RecommendationsPanel recommendations={data?.criticalRecs || []} compact />
        </div>
      </div>
    </div>
  );
}
