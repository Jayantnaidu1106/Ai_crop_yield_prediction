import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, History, Lightbulb, LogOut, Menu, X, Wheat,
  Settings, Phone, MapPin
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/predict', icon: TrendingUp, label: 'Predict Yield' },
  { path: '/history', icon: History, label: 'Yield History' },
  { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, onLogout, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const displayName = user?.name || 'Farmer';
  const initials = displayName.charAt(0).toUpperCase();
  const maskedPhone = user?.phone_number
    ? '•'.repeat(Math.max(0, user.phone_number.length - 4)) + user.phone_number.slice(-4)
    : '';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-width)', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex', flexDirection: 'column',
        zIndex: 50, transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined
      }} className="sidebar">
        {/* Logo */}
        <div style={{
          padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-green)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Wheat size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--green-400)' }}>
              FarmPlus
            </h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              SMART AGRICULTURE
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--green-400)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem', transition: 'all 0.2s ease',
                  borderLeft: isActive ? '3px solid var(--green-500)' : '3px solid transparent'
                }}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile Card + Logout */}
        <div style={{ borderTop: '1px solid var(--border-glass)' }}>
          {/* Profile mini-card */}
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="sidebar-profile-card"
            style={{ textDecoration: 'none' }}
          >
            <div className="sidebar-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {displayName}
              </p>
              <p style={{
                fontSize: '0.75rem', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Phone size={10} /> {maskedPhone}
              </p>
              {user?.farm_location && (
                <p style={{
                  fontSize: '0.7rem', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4, marginTop: 1,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  <MapPin size={10} /> {user.farm_location}
                </p>
              )}
            </div>
          </NavLink>

          {/* Logout */}
          <div style={{ padding: '8px 12px 16px' }}>
            <button
              onClick={onLogout}
              className="btn btn-ghost btn-full"
              style={{ justifyContent: 'flex-start', gap: '12px', color: 'var(--text-muted)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-glass)',
        display: 'none', alignItems: 'center', padding: '0 16px',
        justifyContent: 'space-between', zIndex: 45
      }} className="mobile-topbar">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost" style={{ padding: 8 }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wheat size={20} color="var(--green-400)" />
          <span style={{ fontWeight: 700, color: 'var(--green-400)' }}>FarmPlus</span>
        </div>
        <NavLink to="/settings" className="btn btn-ghost" style={{ padding: 8 }}>
          <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{initials}</div>
        </NavLink>
      </div>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%) !important; }
          .sidebar { transform: ${sidebarOpen ? 'translateX(0) !important' : 'translateX(-100%) !important'}; }
          .mobile-topbar { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
      `}
      </style>
    </div>
  );
}
