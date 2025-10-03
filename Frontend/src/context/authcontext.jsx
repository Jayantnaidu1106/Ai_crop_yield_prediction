// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Check local storage for existing token for persistence
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [userNumber, setUserNumber] = useState(null); 
    const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);
    const [farmLocation, setFarmLocation] = useState(
        JSON.parse(localStorage.getItem('farmLocation')) || null
    );

    const login = (token) => {
        localStorage.setItem('token', token);
        setAuthToken(token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('farmLocation');
        setAuthToken(null);
        setFarmLocation(null);
        setIsAuthenticated(false);
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
            farmLocation,
            updateFarmLocation
        }}>
            {children}
        </AuthContext.Provider>
    );
};