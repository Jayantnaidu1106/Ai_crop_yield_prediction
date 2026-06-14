import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import YieldHistoryPage from './pages/YieldHistoryPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { isAuthenticated, user, loading, login, logout, updateUser } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={login} />;
  }

  return (
    <Layout onLogout={logout} user={user}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/predict" element={<PredictionPage />} />
        <Route path="/history" element={<YieldHistoryPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/settings" element={<ProfilePage user={user} onUpdateUser={updateUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
