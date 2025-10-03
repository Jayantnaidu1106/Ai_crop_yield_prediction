// components/Weather/WeatherAlerts.jsx
import React, { useState, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';

const WeatherAlerts = ({ lat, lon, className = '' }) => {
    const { alerts, loading, error, getWeatherAlerts } = useWeather();
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (lat && lon) {
            getWeatherAlerts(lat, lon);
        }
    }, [lat, lon, getWeatherAlerts]);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'medium':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'low':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'high':
                return '🚨';
            case 'medium':
                return '⚠️';
            case 'low':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const getAlertTypeIcon = (type) => {
        const typeIcons = {
            'heat_wave': '🔥',
            'frost': '❄️',
            'high_wind': '💨',
            'heavy_rain': '🌧️',
            'high_humidity': '💧',
            'drought': '🏜️',
            'storm': '⛈️'
        };
        return typeIcons[type] || '⚠️';
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
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
                    <div>
                        <div className="font-medium">Alerts Unavailable</div>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!alerts || alerts.length === 0) {
        return (
            <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center text-green-700">
                    <span className="text-xl mr-2">✅</span>
                    <div>
                        <div className="font-medium">No Weather Alerts</div>
                        <div className="text-sm">Weather conditions are currently normal</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
            <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🚨</span>
                    Weather Alerts ({alerts.length})
                </h3>
                <span className={`transition-transform duration-300 text-gray-400 ${
                    isExpanded ? 'rotate-180' : ''
                }`}>
                    ▼
                </span>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {alerts.map((alert, index) => (
                        <div 
                            key={index}
                            className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 text-xl">
                                    {getAlertTypeIcon(alert.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-sm">
                                            {alert.title}
                                        </h4>
                                        <div className="flex items-center text-xs">
                                            <span className="mr-1">
                                                {getSeverityIcon(alert.severity)}
                                            </span>
                                            <span className="capitalize font-medium">
                                                {alert.severity}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm mb-3">
                                        {alert.message}
                                    </p>
                                    
                                    {alert.recommendations && alert.recommendations.length > 0 && (
                                        <div>
                                            <div className="text-xs font-medium mb-2">
                                                Recommendations:
                                            </div>
                                            <ul className="text-xs space-y-1">
                                                {alert.recommendations.map((rec, recIndex) => (
                                                    <li key={recIndex} className="flex items-start">
                                                        <span className="mr-2 mt-0.5">•</span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                        Alerts are updated every hour based on current weather conditions
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherAlerts;