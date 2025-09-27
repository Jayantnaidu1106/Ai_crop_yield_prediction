// components/ML/PredictionCard.jsx
// Prediction card component for dashboard overview

import React, { useState, useEffect } from 'react';
import { useMLPredictions } from '../../hooks/useMLPredictions';

const PredictionCard = ({ className = '' }) => {
    const { 
        insights, 
        accuracy, 
        isLoading, 
        error, 
        fetchPredictionInsights,
        fetchPredictionAccuracy 
    } = useMLPredictions();
    
    const [refreshing, setRefreshing] = useState(false);

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchPredictionInsights(3),
                fetchPredictionAccuracy(365)
            ]);
        } catch (err) {
            console.error('Error refreshing prediction data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    // Auto-refresh on mount
    useEffect(() => {
        if (!insights) {
            handleRefresh();
        }
    }, []);

    // Get confidence color
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Get confidence label
    const getConfidenceLabel = (confidence) => {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.6) return 'Medium';
        return 'Low';
    };

    if (isLoading && !insights) {
        return (
            <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    if (error && !insights) {
        return (
            <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
                <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Prediction Service Unavailable
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Unable to load prediction data
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        disabled={refreshing}
                    >
                        {refreshing ? 'Retrying...' : 'Retry'}
                    </button>
                </div>
            </div>
        );
    }

    const latestPrediction = insights?.recentPredictions?.[0];
    const avgConfidence = insights?.averageConfidence || 0;
    const totalPredictions = insights?.totalPredictions || 0;

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    🌾 Yield Predictions
                </h3>
                <button
                    onClick={handleRefresh}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={refreshing}
                    title="Refresh predictions"
                >
                    <svg 
                        className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                        />
                    </svg>
                </button>
            </div>

            {/* Latest Prediction */}
            {latestPrediction ? (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Latest Prediction</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(latestPrediction.confidence)}`}>
                            {getConfidenceLabel(latestPrediction.confidence)} Confidence
                        </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-bold text-gray-800">
                                    {latestPrediction.predictedYield?.value?.toLocaleString() || 'N/A'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {latestPrediction.predictedYield?.unit || 'kg/hectare'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {latestPrediction.crop} • {latestPrediction.season}
                                </p>
                            </div>
                            
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${getConfidenceColor(latestPrediction.confidence)}`}>
                                    {Math.round((latestPrediction.confidence || 0) * 100)}%
                                </div>
                                <p className="text-xs text-gray-500">Confidence</p>
                            </div>
                        </div>
                        
                        {/* Prediction Range */}
                        {latestPrediction.predictedYield?.range && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                    Expected range: {latestPrediction.predictedYield.range.min?.toLocaleString()} - {latestPrediction.predictedYield.range.max?.toLocaleString()} {latestPrediction.predictedYield.unit}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No recent predictions</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Create your first prediction to see insights here
                    </p>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {totalPredictions}
                    </div>
                    <p className="text-xs text-gray-600">Total Predictions</p>
                </div>
                
                <div className="text-center">
                    <div className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                        {Math.round(avgConfidence * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">Avg Confidence</p>
                </div>
            </div>

            {/* Accuracy Display */}
            {accuracy && accuracy.accuracy !== null && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Model Accuracy</span>
                        <span className="text-sm font-semibold text-blue-600">
                            {Math.round(accuracy.accuracy * 100)}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Based on {accuracy.count} completed predictions
                    </p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
                <button 
                    className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => {
                        // Navigate to prediction page
                        window.location.href = '/predict';
                    }}
                >
                    New Prediction
                </button>
                
                <button 
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => {
                        // Navigate to yield history
                        window.location.href = '/yield-history';
                    }}
                >
                    View History
                </button>
            </div>

            {/* Status Indicator */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        <span>ML Service Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictionCard;
