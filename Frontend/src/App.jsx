// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/authpage';
import CleanDashboard from './pages/CleanDashboard';
import SplashPage from './pages/splashpage';
import SignUpPage from './pages/SignUpPage';

// Custom component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
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

                    {/* Redirect all unknown routes to splash page */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;