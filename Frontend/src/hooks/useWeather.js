// hooks/useWeather.js

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000/api/weather';

export const useWeather = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [agriculturalData, setAgriculturalData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Get current weather by coordinates
     */
    const getCurrentWeather = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/current?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data.success) {
                setWeatherData(data.data);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching current weather:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get current weather by city name
     */
    const getCurrentWeatherByCity = useCallback(async (city, country = 'IN') => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({ city });
            if (country) params.append('country', country);
            
            const response = await fetch(`${API_BASE_URL}/current/city?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setWeatherData(data.data);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching weather by city:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get weather forecast
     */
    const getForecast = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data.success) {
                setForecastData(data.data);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching forecast:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get forecast by city name
     */
    const getForecastByCity = useCallback(async (city, country = 'IN') => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({ city });
            if (country) params.append('country', country);
            
            const response = await fetch(`${API_BASE_URL}/forecast/city?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setForecastData(data.data);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching forecast by city:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get agricultural weather data
     */
    const getAgriculturalWeather = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/agricultural?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data.success) {
                setAgriculturalData(data.data);
                setWeatherData(data.data.current);
                setForecastData(data.data.forecast);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching agricultural weather:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get weather alerts
     */
    const getWeatherAlerts = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/alerts?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data.success) {
                setAlerts(data.data.alerts);
                return data.data.alerts;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching weather alerts:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get weather for multiple cities
     */
    const getMultipleCitiesWeather = useCallback(async (cities) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-cities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cities }),
            });
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching multiple cities weather:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get user's location and fetch weather
     */
    const getWeatherByLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            return null;
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const weather = await getCurrentWeather(latitude, longitude);
                    resolve(weather);
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    setError(errorMessage);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }, [getCurrentWeather]);

    /**
     * Clear all weather data
     */
    const clearWeatherData = useCallback(() => {
        setWeatherData(null);
        setForecastData(null);
        setAgriculturalData(null);
        setAlerts([]);
        setError(null);
    }, []);

    return {
        // Data
        weatherData,
        forecastData,
        agriculturalData,
        alerts,
        loading,
        error,
        
        // Methods
        getCurrentWeather,
        getCurrentWeatherByCity,
        getForecast,
        getForecastByCity,
        getAgriculturalWeather,
        getWeatherAlerts,
        getMultipleCitiesWeather,
        getWeatherByLocation,
        clearWeatherData
    };
};

/**
 * Hook for getting weather by user's current location
 */
export const useLocationWeather = () => {
    const weather = useWeather();
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        const fetchLocationWeather = async () => {
            setLocationLoading(true);
            try {
                await weather.getWeatherByLocation();
            } catch (error) {
                console.error('Failed to get location weather:', error);
            } finally {
                setLocationLoading(false);
            }
        };

        fetchLocationWeather();
    }, []);

    return {
        ...weather,
        locationLoading
    };
};

/**
 * Hook for specific city weather with auto-refresh
 */
export const useCityWeather = (city, country = 'IN', refreshInterval = 300000) => {
    const weather = useWeather();

    useEffect(() => {
        if (city) {
            weather.getCurrentWeatherByCity(city, country);
        }
    }, [city, country, weather]);

    useEffect(() => {
        if (!city || !refreshInterval) return;

        const interval = setInterval(() => {
            weather.getCurrentWeatherByCity(city, country);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [city, country, refreshInterval, weather]);

    return weather;
};

export default useWeather;
