import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)', padding: '12px 16px',
      boxShadow: 'var(--shadow-md)'
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: '0.85rem' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

export function YieldTrendChart({ data = [] }) {
  const chartData = data.map((d, i) => ({
    name: d.date ? new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : `#${i + 1}`,
    yield: d.yield || d.yield_prediction || 0,
    confidence: d.confidence || d.confidence_score || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area type="monotone" dataKey="yield" stroke="#22c55e" fill="url(#yieldGrad)"
          strokeWidth={2} name="Yield (t/ha)" dot={{ r: 3, fill: '#22c55e' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CropComparisonChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: d._id ? d._id.charAt(0).toUpperCase() + d._id.slice(1) : 'Unknown',
    avg_yield: d.avg_yield ? Number(d.avg_yield.toFixed(2)) : 0,
    count: d.count || 0
  })).slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} angle={-20} textAnchor="end" height={60} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg_yield" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Yield (t/ha)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ScenarioChart({ data = [] }) {
  const chartData = data.filter(d => !d.error).map(d => ({
    name: d.scenario_name || 'Scenario',
    yield: d.yield_prediction || 0,
    lower: d.lower_bound || 0,
    upper: d.upper_bound || 0,
    confidence: d.confidence_score || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="yield" fill="#22c55e" radius={[4, 4, 0, 0]} name="Predicted Yield" />
        <Bar dataKey="confidence" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Confidence %" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default YieldTrendChart;
