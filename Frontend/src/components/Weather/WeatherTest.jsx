// src/components/Weather/WeatherTest.jsx - Simple weather test component

import React, { useState } from 'react';
import { useWeather } from '../../hooks/useWeather';

const WeatherTest = () => {
    const { weatherData, loading, error, getCurrentWeatherByCity, getCurrentWeather } = useWeather();
    const [testCity, setTestCity] = useState('Delhi');

    const testCityWeather = () => {
        getCurrentWeatherByCity(testCity);
    };

    const testLocationWeather = () => {
        // Test with Tumakuru coordinates
        getCurrentWeather(13.3379, 77.1022);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md">
            <h3 className="text-lg font-bold mb-4">🧪 Weather API Test</h3>
            
            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={testCity}
                        onChange={(e) => setTestCity(e.target.value)}
                        placeholder="Enter city name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                        onClick={testCityWeather}
                        className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        Test City Weather
                    </button>
                </div>
                
                <button
                    onClick={testLocationWeather}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                    Test Tumakuru Weather
                </button>
                
                {loading && (
                    <div className="text-center py-4">
                        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading weather...</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {weatherData && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded">
                        <h4 className="font-semibold text-green-800 mb-2">
                            📍 {weatherData.location.name}, {weatherData.location.country}
                        </h4>
                        <div className="text-sm space-y-1">
                            <p><strong>Temperature:</strong> {weatherData.temperature.current}°C</p>
                            <p><strong>Feels like:</strong> {weatherData.temperature.feelsLike}°C</p>
                            <p><strong>Condition:</strong> {weatherData.weather.main} - {weatherData.weather.description}</p>
                            <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
                            <p><strong>Wind:</strong> {weatherData.wind.speed} m/s</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherTest;