// components/Weather/WeatherWidget.jsx
import React, { useState } from 'react';
import useLocationWeather from '../../hooks/useLocationWeather';

const WeatherWidget = ({ className = '' }) => {
    const { weatherData, loading, error, locationStatus, currentCity, currentCountry } = useLocationWeather();
    const [isExpanded, setIsExpanded] = useState(false);

    const getWeatherIcon = (condition, icon) => {
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

    if (loading && !weatherData) {
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

    if (!weatherData) return null;

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ${
            isExpanded ? 'p-6' : 'p-4'
        } ${className}`}>
            <div 
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">
                            {getWeatherIcon(weatherData.weather.main, weatherData.weather.icon)}
                        </span>
                        <div>
                            <div className="font-semibold text-gray-900 text-lg">
                                {weatherData.temperature.current}°C
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                                <span className="mr-1">📍</span>
                                {weatherData?.location?.name || currentCity}, {weatherData?.location?.country || currentCountry}
                                {locationStatus.permission === 'granted' && locationStatus.userLocation && (
                                    <span className="ml-2 text-xs text-green-600" title="Using your current location">🌍</span>
                                )}
                                {locationStatus.permission === 'denied' && (
                                    <span className="ml-2 text-xs text-orange-600" title="Location access denied - showing default location">🚫</span>
                                )}
                                {!locationStatus.userLocation && locationStatus.permission === 'granted' && (
                                    <span className="ml-2 text-xs text-blue-600" title="Getting your location...">⌛</span>
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

            {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 capitalize">
                        {weatherData.weather.description}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Feels like:</span>
                            <span className="font-medium">{weatherData.temperature.feelsLike}°C</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Humidity:</span>
                            <span className="font-medium">{weatherData.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Wind:</span>
                            <span className="font-medium">{weatherData.wind.speed} m/s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Visibility:</span>
                            <span className="font-medium">{weatherData.visibility} km</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>Last updated: {new Date(weatherData.timestamp).toLocaleTimeString()}</span>
                        {loading && <span className="animate-pulse">Updating...</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;