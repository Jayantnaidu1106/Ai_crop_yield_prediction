// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AuthPage from './pages/authpage';
import CleanDashboard from './pages/CleanDashboard';
import SplashPage from './pages/splashpage';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import MLPredictionForm from './components/MLPredictionForm';
import './i18n'; // Import i18n configuration

// Custom component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Landing Page - Splash Screen with Language Selection */}
                        <Route path="/" element={<SplashPage />} />

                        {/* Public Route for Login/Sign Up */}
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/signup" element={<SignUpPage />} />

                        {/* Protected Route for Main App Content */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <CleanDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Route for Settings */}
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Route for ML Predictions */}
                        <Route
                            path="/predictions"
                            element={
                                <ProtectedRoute>
                                    <MLPredictionForm />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirect all unknown routes to splash page */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;