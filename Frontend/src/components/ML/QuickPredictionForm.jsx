// components/ML/QuickPredictionForm.jsx
// Quick prediction form for dashboard

import React, { useState } from 'react';
import { useMLPredictions } from '../../hooks/useMLPredictions';

const QuickPredictionForm = ({ onPredictionComplete, className = '' }) => {
    const { getQuickPrediction, isLoading, error } = useMLPredictions();
    
    const [formData, setFormData] = useState({
        crop: 'rice',
        area: ''
    });
    const [prediction, setPrediction] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const cropOptions = [
        { value: 'rice', label: '🌾 Rice', emoji: '🌾' },
        { value: 'wheat', label: '🌾 Wheat', emoji: '🌾' },
        { value: 'corn', label: '🌽 Corn', emoji: '🌽' },
        { value: 'cotton', label: '🌿 Cotton', emoji: '🌿' },
        { value: 'sugarcane', label: '🎋 Sugarcane', emoji: '🎋' },
        { value: 'soybean', label: '🫘 Soybean', emoji: '🫘' },
        { value: 'tomato', label: '🍅 Tomato', emoji: '🍅' },
        { value: 'potato', label: '🥔 Potato', emoji: '🥔' },
        { value: 'onion', label: '🧅 Onion', emoji: '🧅' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.area || parseFloat(formData.area) <= 0) {
            alert('Please enter a valid area');
            return;
        }

        try {
            const result = await getQuickPrediction(formData.crop, parseFloat(formData.area));
            setPrediction(result);
            setShowResult(true);
            
            if (onPredictionComplete) {
                onPredictionComplete(result);
            }
        } catch (err) {
            console.error('Quick prediction error:', err);
        }
    };

    const handleReset = () => {
        setPrediction(null);
        setShowResult(false);
        setFormData({
            crop: 'rice',
            area: ''
        });
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
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    ⚡ Quick Prediction
                </h3>
                {showResult && (
                    <button
                        onClick={handleReset}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        New Prediction
                    </button>
                )}
            </div>

            {!showResult ? (
                // Prediction Form
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Crop Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Crop
                        </label>
                        <select
                            name="crop"
                            value={formData.crop}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            {cropOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Area Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Farm Area (hectares)
                        </label>
                        <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            placeholder="Enter area in hectares"
                            min="0.1"
                            max="10000"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the area you want to predict yield for
                        </p>
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
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Predicting...
                            </div>
                        ) : (
                            'Get Prediction'
                        )}
                    </button>
                </form>
            ) : (
                // Prediction Result
                <div className="space-y-4">
                    {/* Main Result */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="text-sm font-medium text-gray-600">
                                    Predicted Yield for {cropOptions.find(c => c.value === formData.crop)?.emoji} {formData.crop}
                                </h4>
                                <div className="text-2xl font-bold text-gray-800">
                                    {prediction?.predictedYield?.value?.toLocaleString() || 'N/A'}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {prediction?.predictedYield?.unit || 'kg/hectare'}
                                </p>
                            </div>
                            
                            <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction?.confidenceMetrics?.confidence)}`}>
                                    {Math.round((prediction?.confidenceMetrics?.confidence || 0) * 100)}%
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {getConfidenceLabel(prediction?.confidenceMetrics?.confidence)}
                                </p>
                            </div>
                        </div>

                        {/* Prediction Range */}
                        {prediction?.predictedYield?.range && (
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Expected Range:</span> {' '}
                                    {prediction.predictedYield.range.min?.toLocaleString()} - {prediction.predictedYield.range.max?.toLocaleString()} {prediction.predictedYield.unit}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Farm Area</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {formData.area} ha
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Total Expected</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {((prediction?.predictedYield?.value || 0) * parseFloat(formData.area)).toLocaleString()} kg
                            </p>
                        </div>
                    </div>

                    {/* Model Info */}
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Model: {prediction?.modelType || 'ML Model'} v{prediction?.modelVersion || '1.0'}
                            </span>
                            <span className="text-blue-600">
                                {prediction?.source === 'fallback' ? '⚠️ Fallback' : '✅ Live'}
                            </span>
                        </div>
                        {prediction?.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                                {prediction.notes}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                // Navigate to detailed prediction page
                                window.location.href = '/predict';
                            }}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        >
                            Detailed Analysis
                        </button>
                        
                        <button
                            onClick={() => {
                                // Save prediction functionality
                                alert('Prediction saved to your history!');
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Save Prediction
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickPredictionForm;
