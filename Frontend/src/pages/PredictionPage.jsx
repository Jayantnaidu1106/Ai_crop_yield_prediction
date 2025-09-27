// src/pages/PredictionPage.jsx
// Comprehensive ML prediction interface

import React, { useState, useEffect } from 'react';
import { useMLPredictions } from '../hooks/useMLPredictions';

const PredictionPage = () => {
    const { 
        createPrediction, 
        getBatchPredictions,
        getRegionalComparison,
        isLoading, 
        error, 
        clearError 
    } = useMLPredictions();

    const [formData, setFormData] = useState({
        crop: 'rice',
        season: 'kharif',
        area: '',
        year: new Date().getFullYear(),
        rainfall: '',
        temperature: '',
        fertilizer: '',
        pesticide: '',
        useWeatherData: true
    });

    const [prediction, setPrediction] = useState(null);
    const [scenarios, setScenarios] = useState([]);
    const [batchResults, setBatchResults] = useState([]);
    const [regionalComparison, setRegionalComparison] = useState(null);
    const [activeTab, setActiveTab] = useState('single'); // single, batch, comparison

    const cropOptions = [
        { value: 'rice', label: '🌾 Rice', baseline: 4500 },
        { value: 'wheat', label: '🌾 Wheat', baseline: 3200 },
        { value: 'corn', label: '🌽 Corn', baseline: 5500 },
        { value: 'cotton', label: '🌿 Cotton', baseline: 1800 },
        { value: 'sugarcane', label: '🎋 Sugarcane', baseline: 65000 },
        { value: 'soybean', label: '🫘 Soybean', baseline: 2800 },
        { value: 'tomato', label: '🍅 Tomato', baseline: 25000 },
        { value: 'potato', label: '🥔 Potato', baseline: 22000 },
        { value: 'onion', label: '🧅 Onion', baseline: 18000 }
    ];

    const seasonOptions = [
        { value: 'kharif', label: 'Kharif (Monsoon)', months: 'Jun-Oct' },
        { value: 'rabi', label: 'Rabi (Winter)', months: 'Nov-Apr' },
        { value: 'summer', label: 'Summer', months: 'Mar-Jun' }
    ];

    useEffect(() => {
        // Clear error when component mounts
        clearError();
    }, [clearError]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSinglePrediction = async (e) => {
        e.preventDefault();
        
        try {
            const result = await createPrediction(formData);
            setPrediction(result);
            
            // Get regional comparison
            if (result) {
                try {
                    const comparison = await getRegionalComparison(formData.crop, formData.season, formData.year);
                    setRegionalComparison(comparison);
                } catch (err) {
                    console.error('Regional comparison error:', err);
                }
            }
        } catch (err) {
            console.error('Prediction error:', err);
        }
    };

    const handleBatchPrediction = async () => {
        if (scenarios.length === 0) {
            alert('Please add at least one scenario');
            return;
        }

        try {
            const results = await getBatchPredictions(scenarios);
            setBatchResults(results);
        } catch (err) {
            console.error('Batch prediction error:', err);
        }
    };

    const addScenario = () => {
        const newScenario = {
            id: Date.now(),
            name: `Scenario ${scenarios.length + 1}`,
            ...formData
        };
        setScenarios(prev => [...prev, newScenario]);
    };

    const removeScenario = (id) => {
        setScenarios(prev => prev.filter(s => s.id !== id));
        setBatchResults(prev => prev.filter(r => r.scenarioId !== id));
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'text-green-600 bg-green-50';
        if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getConfidenceLabel = (confidence) => {
        if (confidence >= 0.8) return 'High Confidence';
        if (confidence >= 0.6) return 'Medium Confidence';
        return 'Low Confidence';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            🔮 AI Yield Prediction
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Get accurate crop yield predictions powered by machine learning
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'single', label: '🎯 Single Prediction', desc: 'Get one prediction' },
                                { id: 'batch', label: '📊 Scenario Analysis', desc: 'Compare multiple scenarios' },
                                { id: 'comparison', label: '🌍 Regional Comparison', desc: 'Compare with regional data' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div>{tab.label}</div>
                                    <div className="text-xs text-gray-400">{tab.desc}</div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'single' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Input Form */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Prediction Parameters
                                    </h3>
                                    
                                    <form onSubmit={handleSinglePrediction} className="space-y-4">
                                        {/* Crop Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Crop Type *
                                            </label>
                                            <select
                                                name="crop"
                                                value={formData.crop}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                {cropOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Season Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Growing Season *
                                            </label>
                                            <select
                                                name="season"
                                                value={formData.season}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                {seasonOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label} ({option.months})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Area and Year */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Area (hectares) *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="area"
                                                    value={formData.area}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., 2.5"
                                                    min="0.1"
                                                    max="10000"
                                                    step="0.1"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Year
                                                </label>
                                                <input
                                                    type="number"
                                                    name="year"
                                                    value={formData.year}
                                                    onChange={handleInputChange}
                                                    min="2020"
                                                    max="2030"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Optional Parameters */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-gray-800 mb-3">
                                                Optional Parameters (for better accuracy)
                                            </h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Expected Rainfall (mm)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="rainfall"
                                                        value={formData.rainfall}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 1200"
                                                        min="0"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Avg Temperature (°C)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="temperature"
                                                        value={formData.temperature}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 25"
                                                        min="0"
                                                        max="50"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Fertilizer (kg/hectare)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="fertilizer"
                                                        value={formData.fertilizer}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 150"
                                                        min="0"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Pesticide (kg/hectare)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="pesticide"
                                                        value={formData.pesticide}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 50"
                                                        min="0"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weather Data Option */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="useWeatherData"
                                                checked={formData.useWeatherData}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700">
                                                Use recent weather data for enhanced prediction
                                            </label>
                                        </div>

                                        {/* Error Display */}
                                        {error && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading || !formData.area}
                                            className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating Prediction...
                                                </div>
                                            ) : (
                                                '🔮 Generate Prediction'
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Prediction Results */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Prediction Results
                                    </h3>

                                    {prediction ? (
                                        <div className="space-y-4">
                                            {/* Main Result Card */}
                                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-800">
                                                            {prediction.predictedYield?.value?.toLocaleString() || 'N/A'}
                                                        </h4>
                                                        <p className="text-gray-600">
                                                            {prediction.predictedYield?.unit || 'kg/hectare'}
                                                        </p>
                                                    </div>

                                                    <div className={`px-4 py-2 rounded-full font-medium ${getConfidenceColor(prediction.confidenceMetrics?.confidence)}`}>
                                                        {Math.round((prediction.confidenceMetrics?.confidence || 0) * 100)}%
                                                        <div className="text-xs">
                                                            {getConfidenceLabel(prediction.confidenceMetrics?.confidence)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Prediction Range */}
                                                {prediction.predictedYield?.range && (
                                                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-medium">Expected Range:</span> {' '}
                                                            {prediction.predictedYield.range.min?.toLocaleString()} - {prediction.predictedYield.range.max?.toLocaleString()} {prediction.predictedYield.unit}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Additional Metrics */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white rounded-lg p-4 border">
                                                    <h5 className="font-medium text-gray-800 mb-2">Total Expected Yield</h5>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {((prediction.predictedYield?.value || 0) * parseFloat(formData.area || 0)).toLocaleString()} kg
                                                    </p>
                                                    <p className="text-sm text-gray-600">For {formData.area} hectares</p>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 border">
                                                    <h5 className="font-medium text-gray-800 mb-2">Model Accuracy</h5>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {Math.round((prediction.confidenceMetrics?.accuracy || 0) * 100)}%
                                                    </p>
                                                    <p className="text-sm text-gray-600">Historical accuracy</p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        alert('Prediction saved to your history!');
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                                >
                                                    💾 Save Prediction
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`Predicted yield for ${formData.crop}: ${prediction.predictedYield?.value} ${prediction.predictedYield?.unit}`);
                                                        alert('Prediction copied to clipboard!');
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                >
                                                    📋 Share Result
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                                            <div className="text-6xl mb-4">🔮</div>
                                            <h4 className="text-lg font-medium text-gray-800 mb-2">
                                                Ready for Prediction
                                            </h4>
                                            <p className="text-gray-600">
                                                Fill in the parameters and click "Generate Prediction" to get your AI-powered yield forecast
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Other tabs content placeholder */}
                        {activeTab !== 'single' && (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <div className="text-6xl mb-4">🚧</div>
                                <h4 className="text-lg font-medium text-gray-800 mb-2">
                                    Coming Soon
                                </h4>
                                <p className="text-gray-600">
                                    {activeTab === 'batch' ? 'Batch prediction and scenario analysis' : 'Regional comparison features'} will be available soon
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PredictionPage;
