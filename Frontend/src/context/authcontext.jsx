// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Check local storage for existing token for persistence
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [userNumber, setUserNumber] = useState(null); 
    const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);

    const login = (token) => {
        localStorage.setItem('token', token);
        setAuthToken(token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, authToken, login, logout, userNumber, setUserNumber }}>
            {children}
        </AuthContext.Provider>
    );
};