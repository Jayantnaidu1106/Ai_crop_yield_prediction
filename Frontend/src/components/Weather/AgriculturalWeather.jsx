// components/Weather/AgriculturalWeather.jsx
import React, { useState, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';

const AgriculturalWeather = ({ className = '' }) => {
    const { agriculturalData, loading, error, getCurrentWeatherByCity } = useWeather();
    const [activeTab, setActiveTab] = useState('irrigation');

    // Always show Delhi's agricultural weather data
    useEffect(() => {
        // For agricultural data, we'll use Delhi coordinates
        const delhiLat = 28.6139;
        const delhiLon = 77.2090;
        
        // Since we don't have agricultural endpoint for city, we'll use coordinates
        // But we'll modify it to always use Delhi coordinates
        getCurrentWeatherByCity('Delhi');
    }, [getCurrentWeatherByCity]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high':
                return '🔴';
            case 'medium':
                return '🟡';
            case 'low':
                return '🟢';
            default:
                return '⚪';
        }
    };

    const tabs = [
        { id: 'irrigation', label: 'Irrigation', icon: '💧' },
        { id: 'planting', label: 'Planting', icon: '🌱' },
        { id: 'harvesting', label: 'Harvesting', icon: '🌾' },
        { id: 'pestControl', label: 'Pest Control', icon: '🐛' }
    ];

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
                    <div className="flex space-x-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-300 rounded w-24"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="text-red-700">
                    <h3 className="font-semibold mb-2">Agricultural Data Unavailable</h3>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!agriculturalData || !agriculturalData.agricultural) return null;

    const currentAdvice = agriculturalData.agricultural[activeTab];

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">🌾</span>
                    Agricultural Weather Insights
                </h3>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Active Tab Content */}
                {currentAdvice && (
                    <div className={`border rounded-lg p-4 ${getPriorityColor(currentAdvice.priority)}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center">
                                <span className="mr-2">{tabs.find(t => t.id === activeTab)?.icon}</span>
                                {tabs.find(t => t.id === activeTab)?.label} Advice
                            </h4>
                            <div className="flex items-center text-sm">
                                <span className="mr-1">{getPriorityIcon(currentAdvice.priority)}</span>
                                <span className="capitalize font-medium">{currentAdvice.priority} Priority</span>
                            </div>
                        </div>
                        
                        <div className="mb-3">
                            <div className="font-medium text-lg mb-2">
                                {currentAdvice.recommendation}
                            </div>
                            <div className="text-sm opacity-80">
                                {currentAdvice.reason}
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Weather Summary */}
                {agriculturalData.current && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Current Conditions</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-semibold text-gray-900">
                                    {agriculturalData.current.temperature.current}°C
                                </div>
                                <div className="text-gray-600">Temperature</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-gray-900">
                                    {agriculturalData.current.humidity}%
                                </div>
                                <div className="text-gray-600">Humidity</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-gray-900">
                                    {agriculturalData.current.wind.speed} m/s
                                </div>
                                <div className="text-gray-600">Wind Speed</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-gray-900">
                                    {agriculturalData.current.pressure} hPa
                                </div>
                                <div className="text-gray-600">Pressure</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Next 3 Days Precipitation */}
                {agriculturalData.forecast && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                            <span className="mr-2">🌧️</span>
                            Upcoming Precipitation
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            {agriculturalData.forecast.forecast.slice(0, 3).map((day, index) => (
                                <div key={index} className="text-center">
                                    <div className="font-semibold text-blue-900">
                                        {day.precipitation > 0 ? `${day.precipitation}mm` : 'No rain'}
                                    </div>
                                    <div className="text-blue-700">
                                        {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'Day 3'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 text-xs text-gray-500 text-center">
                    Agricultural insights are updated every 6 hours based on weather forecasts
                </div>
            </div>
        </div>
    );
};

export default AgriculturalWeather;