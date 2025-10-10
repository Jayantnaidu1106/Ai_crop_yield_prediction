// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Check local storage for existing token for persistence
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [userNumber, setUserNumber] = useState(null); 
    const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);
    const [userProfile, setUserProfile] = useState(
        JSON.parse(localStorage.getItem('userProfile')) || null
    );
    const [farmLocation, setFarmLocation] = useState(
        JSON.parse(localStorage.getItem('farmLocation')) || null
    );

    const login = (token, userData = null) => {
        localStorage.setItem('token', token);
        setAuthToken(token);
        setIsAuthenticated(true);
        
        // Store user profile if provided
        if (userData) {
            localStorage.setItem('userProfile', JSON.stringify(userData));
            setUserProfile(userData);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('farmLocation');
        localStorage.removeItem('userProfile');
        setAuthToken(null);
        setFarmLocation(null);
        setUserProfile(null);
        setIsAuthenticated(false);
    };

    const updateUserProfile = (profile) => {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUserProfile(profile);
    };

    const updateFarmLocation = (location) => {
        localStorage.setItem('farmLocation', JSON.stringify(location));
        setFarmLocation(location);
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            authToken, 
            login, 
            logout, 
            userNumber, 
            setUserNumber,
            userProfile,
            updateUserProfile,
            farmLocation,
            updateFarmLocation
        }}>
            {children}
        </AuthContext.Provider>
    );
};