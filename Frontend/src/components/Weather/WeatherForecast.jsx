// components/Weather/WeatherForecast.jsx
import React, { useState, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';

const WeatherForecast = ({ city = 'Delhi', className = '' }) => {
    const { forecastData, loading, error, getForecastByCity } = useWeather();

    useEffect(() => {
        getForecastByCity(city);
    }, [city, getForecastByCity]);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="animate-pulse flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                                <div className="h-4 bg-gray-300 rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <h3 className="text-lg font-semibold text-red-700 mb-2">Forecast Unavailable</h3>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (!forecastData || !forecastData.forecast) return null;

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">5-Day Forecast</h3>
                <div className="text-sm text-gray-600">
                    {forecastData.location.name}
                </div>
            </div>

            <div className="space-y-4">
                {forecastData.forecast.slice(0, 5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-4 flex-1">
                            <span className="text-2xl">
                                {getWeatherIcon(day.weather.main)}
                            </span>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {formatDate(day.date)}
                                </div>
                                <div className="text-sm text-gray-600 capitalize">
                                    {day.weather.description}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600">💧</span>
                                <span className="text-blue-600 font-medium">
                                    {day.precipitation > 0 ? `${day.precipitation}mm` : '0mm'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600">💨</span>
                                <span className="text-gray-700">
                                    {day.windSpeed}m/s
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                    {day.temperature.max}°
                                </div>
                                <div className="text-gray-600">
                                    {day.temperature.min}°
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
                Forecast updates every hour
            </div>
        </div>
    );
};

export default WeatherForecast;