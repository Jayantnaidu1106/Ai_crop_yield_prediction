// hooks/useLocationWeather.js
import { useState, useEffect, useCallback } from 'react';
import { useWeather } from './useWeather';

/**
 * Custom hook that requests location permission from user
 * but always displays Delhi weather data
 */
export const useLocationWeather = () => {
    const weather = useWeather();
    const [locationStatus, setLocationStatus] = useState({
        permission: 'prompt', // 'granted', 'denied', 'prompt'
        requested: false,
        userLocation: null,
        error: null
    });

    const requestLocationPermission = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocationStatus(prev => ({
                ...prev,
                permission: 'unsupported',
                error: 'Geolocation is not supported by this browser',
                requested: true
            }));
            // Still load Delhi weather
            await weather.getCurrentWeatherByCity('Delhi');
            return;
        }

        try {
            // Check existing permission status
            if ('permissions' in navigator) {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                
                if (permission.state === 'granted') {
                    // Get user location and show weather for that location
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            setLocationStatus(prev => ({
                                ...prev,
                                permission: 'granted',
                                requested: true,
                                userLocation: {
                                    lat: position.coords.latitude,
                                    lon: position.coords.longitude
                                }
                            }));
                            // Use actual user location coordinates
                            weather.getCurrentWeather(position.coords.latitude, position.coords.longitude);
                        },
                        (error) => {
                            setLocationStatus(prev => ({
                                ...prev,
                                permission: 'error',
                                requested: true,
                                error: 'Failed to get current position'
                            }));
                            // Fallback to Delhi if location fails
                            weather.getCurrentWeatherByCity('Delhi');
                        },
                        { timeout: 10000, enableHighAccuracy: true }
                    );
                } else if (permission.state === 'denied') {
                    setLocationStatus(prev => ({
                        ...prev,
                        permission: 'denied',
                        requested: true
                    }));
                    weather.getCurrentWeatherByCity('Delhi');
                } else {
                    // Request permission
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            setLocationStatus(prev => ({
                                ...prev,
                                permission: 'granted',
                                requested: true,
                                userLocation: {
                                    lat: position.coords.latitude,
                                    lon: position.coords.longitude
                                }
                            }));
                            // Use actual user location coordinates
                            weather.getCurrentWeather(position.coords.latitude, position.coords.longitude);
                        },
                        (error) => {
                            let permission = 'denied';
                            let errorMessage = 'Location access was denied';
                            
                            switch (error.code) {
                                case error.PERMISSION_DENIED:
                                    permission = 'denied';
                                    errorMessage = 'Location access denied by user';
                                    break;
                                case error.POSITION_UNAVAILABLE:
                                    permission = 'error';
                                    errorMessage = 'Location information unavailable';
                                    break;
                                case error.TIMEOUT:
                                    permission = 'error';
                                    errorMessage = 'Location request timed out';
                                    break;
                            }
                            
                            setLocationStatus(prev => ({
                                ...prev,
                                permission,
                                requested: true,
                                error: errorMessage
                            }));
                            // Fallback to Delhi if location access denied
                            weather.getCurrentWeatherByCity('Delhi');
                        },
                        {
                            timeout: 10000,
                            enableHighAccuracy: true,
                            maximumAge: 300000 // 5 minutes
                        }
                    );
                }
            } else {
                // Fallback for browsers without permissions API
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocationStatus(prev => ({
                            ...prev,
                            permission: 'granted',
                            requested: true,
                            userLocation: {
                                lat: position.coords.latitude,
                                lon: position.coords.longitude
                            }
                        }));
                        // Use actual user location coordinates
                        weather.getCurrentWeather(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        setLocationStatus(prev => ({
                            ...prev,
                            permission: 'denied',
                            requested: true,
                            error: 'Location access denied or unavailable'
                        }));
                        // Fallback to Delhi if location fails
                        weather.getCurrentWeatherByCity('Delhi');
                    },
                    { timeout: 10000, enableHighAccuracy: true }
                );
            }
        } catch (err) {
            setLocationStatus(prev => ({
                ...prev,
                permission: 'error',
                requested: true,
                error: 'Error requesting location permission'
            }));
            weather.getCurrentWeatherByCity('Delhi');
        }
    }, [weather]);

    // Request location permission on first load
    useEffect(() => {
        if (!locationStatus.requested) {
            requestLocationPermission();
        }
    }, [locationStatus.requested, requestLocationPermission]);

    // Auto-refresh weather for user's location every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (locationStatus.userLocation) {
                // Refresh weather for user's actual location
                weather.getCurrentWeather(locationStatus.userLocation.lat, locationStatus.userLocation.lon);
            } else {
                // Fallback to Delhi if no user location
                weather.getCurrentWeatherByCity('Delhi');
            }
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [weather, locationStatus.userLocation]);

    return {
        ...weather,
        locationStatus,
        requestLocationPermission,
        // Dynamic city based on weather data or fallback
        currentCity: weather.weatherData?.location?.name || 'Delhi',
        currentCountry: weather.weatherData?.location?.country || 'India'
    };
};

export default useLocationWeather;