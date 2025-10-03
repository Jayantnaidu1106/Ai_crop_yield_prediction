// components/Weather/DualWeatherWidget.jsx
import React, { useState, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { useAuth } from '../../context/AuthContext';

const DualWeatherWidget = ({ className = '' }) => {
    const { weatherData, loading, error, getCurrentWeather, getCurrentWeatherByCity } = useWeather();
    const { farmLocation } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('farm'); // 'farm' or 'current'
    const [currentLocationData, setCurrentLocationData] = useState(null);
    const [farmLocationData, setFarmLocationData] = useState(null);
    const [locationPermission, setLocationPermission] = useState('prompt');

    // Get farm location weather
    useEffect(() => {
        if (farmLocation) {
            if (farmLocation.latitude && farmLocation.longitude) {
                // Use coordinates if available
                getCurrentWeather(farmLocation.latitude, farmLocation.longitude)
                    .then(data => setFarmLocationData(data));
            } else if (farmLocation.city) {
                // Use city name
                getCurrentWeatherByCity(farmLocation.city)
                    .then(data => setFarmLocationData(data));
            }
        } else {
            // Default to Delhi if no farm location set
            getCurrentWeatherByCity('Delhi')
                .then(data => setFarmLocationData(data));
        }
    }, [farmLocation, getCurrentWeather, getCurrentWeatherByCity]);

    // Get current location weather
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationPermission('granted');
                    getCurrentWeather(position.coords.latitude, position.coords.longitude)
                        .then(data => setCurrentLocationData(data));
                },
                (error) => {
                    setLocationPermission('denied');
                    // Fallback to Delhi if location denied
                    getCurrentWeatherByCity('Delhi')
                        .then(data => setCurrentLocationData(data));
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            getCurrentWeatherByCity('Delhi')
                .then(data => setCurrentLocationData(data));
        }
    }, [getCurrentWeather, getCurrentWeatherByCity]);

    const getWeatherIcon = (condition) => {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        return iconMap[condition] || '🌤️';
    };

    const currentWeather = activeTab === 'farm' ? farmLocationData : currentLocationData;

    if (loading && !currentWeather) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-4 border border-gray-200 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center text-red-700">
                    <span className="text-xl mr-2">⚠️</span>
                    <span className="text-sm">Weather unavailable</span>
                </div>
            </div>
        );
    }

    if (!currentWeather) return null;

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ${
            isExpanded ? 'p-6' : 'p-4'
        } ${className}`}>
            
            {/* Tab Navigation */}
            <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('farm')}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'farm'
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    🌾 Farm Location
                </button>
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'current'
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    📍 Current Location
                </button>
            </div>

            {/* Weather Display */}
            <div 
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">
                            {getWeatherIcon(currentWeather.weather.main)}
                        </span>
                        <div>
                            <div className="font-semibold text-gray-900 text-lg">
                                {currentWeather.temperature.current}°C
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                                <span className="mr-1">
                                    {activeTab === 'farm' ? '🌾' : '📍'}
                                </span>
                                {currentWeather.location.name}, {currentWeather.location.country}
                                {activeTab === 'current' && locationPermission === 'granted' && (
                                    <span className="ml-2 text-xs text-green-600" title="Using your current location">🌍</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-400">
                        <span className={`transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                        }`}>
                            ▼
                        </span>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 capitalize">
                        {currentWeather.weather.description}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Feels like:</span>
                            <span className="font-medium">{currentWeather.temperature.feelsLike}°C</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Humidity:</span>
                            <span className="font-medium">{currentWeather.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Wind:</span>
                            <span className="font-medium">{currentWeather.wind.speed} m/s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Pressure:</span>
                            <span className="font-medium">{currentWeather.pressure} hPa</span>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                        {activeTab === 'farm' ? (
                            <div>
                                <div className="font-medium text-green-700 mb-1">Farm Weather</div>
                                {farmLocation?.address || `${farmLocation?.city}, ${farmLocation?.state}`}
                            </div>
                        ) : (
                            <div>
                                <div className="font-medium text-blue-700 mb-1">Your Current Location</div>
                                {locationPermission === 'granted' ? 'GPS Location' : 'Default Location (Delhi)'}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>Last updated: {new Date(currentWeather.timestamp).toLocaleTimeString()}</span>
                        {loading && <span className="animate-pulse">Updating...</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DualWeatherWidget;