// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authcontext';
import SplashPage from './pages/splashpage';
import AuthPage from './pages/authpage';
import Dashboard from './pages/dashboard';

// Custom component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Initial Splash/Welcome Page */}
                    <Route path="/" element={<SplashPage />} />

                    {/* Public Route for Login/Sign Up */}
                    <Route path="/login" element={<AuthPage />} />

                    {/* Protected Route for Main App Content */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect unknown routes to splash page */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
