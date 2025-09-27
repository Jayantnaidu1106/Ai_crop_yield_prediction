// src/pages/YieldHistory.jsx
import React, { useEffect, useState } from 'react';
import { useMLPredictions } from '../hooks/useMLPredictions';

function YieldHistory() {
    const {
        predictions,
        fetchUserPredictions,
        fetchPredictionTrends,
        updateActualYield,
        isLoading,
        error
    } = useMLPredictions();

    const [chartData, setChartData] = useState([]); // State for chart data
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [timeframe, setTimeframe] = useState(12); // months
    const [showActualYieldModal, setShowActualYieldModal] = useState(null);
    const [actualYieldInput, setActualYieldInput] = useState('');

    useEffect(() => {
        // Fetch prediction data
        fetchUserPredictions();
        fetchPredictionTrends(selectedCrop === 'all' ? null : selectedCrop, timeframe);

        // Placeholder data structure for demo:
        setChartData([
            { year: 2021, yield: 10.5, predicted: 11.2, accuracy: 93.8 },
            { year: 2022, yield: 12.2, predicted: 11.8, accuracy: 96.7 },
            { year: 2023, yield: 15.5, predicted: 14.9, accuracy: 96.1 },
        ]);
    }, [selectedCrop, timeframe]);

    const handleActualYieldSubmit = async (predictionId) => {
        if (!actualYieldInput || parseFloat(actualYieldInput) <= 0) {
            alert('Please enter a valid yield value');
            return;
        }

        try {
            await updateActualYield(predictionId, parseFloat(actualYieldInput));
            setShowActualYieldModal(null);
            setActualYieldInput('');
            // Refresh data
            fetchUserPredictions();
        } catch (err) {
            alert('Failed to update actual yield: ' + err.message);
        }
    };

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 90) return 'text-green-600';
        if (accuracy >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    const cropOptions = [
        { value: 'all', label: 'All Crops' },
        { value: 'rice', label: 'Rice' },
        { value: 'wheat', label: 'Wheat' },
        { value: 'corn', label: 'Corn' },
        { value: 'cotton', label: 'Cotton' }
    ];

    if (isLoading && !predictions.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading yield history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            📊 Yield & Prediction History
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Track your farming performance and prediction accuracy over time
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Crop Filter
                            </label>
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {cropOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Period
                            </label>
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={6}>Last 6 months</option>
                                <option value={12}>Last 12 months</option>
                                <option value={24}>Last 2 years</option>
                                <option value={36}>Last 3 years</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600">Total Predictions</h3>
                        <p className="text-2xl font-bold text-blue-600">{predictions.length}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600">Avg Accuracy</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {predictions.length > 0
                                ? Math.round(predictions.reduce((sum, p) => sum + (p.accuracy || 0), 0) / predictions.length)
                                : 0}%
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {predictions.filter(p => p.actualYield?.value).length}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                        <p className="text-2xl font-bold text-orange-600">
                            {predictions.filter(p => !p.actualYield?.value).length}
                        </p>
                    </div>
                </div>

                {/* Chart Section */}
                <section className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        📈 Yield Trend Analysis
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-2">📊 Interactive Chart Coming Soon</p>
                        <p className="text-sm text-gray-500">
                            Predicted vs Actual yield comparison with trend analysis
                        </p>
                        {/* Placeholder for chart library integration */}
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            {chartData.map((data, index) => (
                                <div key={index} className="bg-white p-3 rounded">
                                    <div className="font-medium">{data.year}</div>
                                    <div className="text-green-600">Actual: {data.yield}</div>
                                    <div className="text-blue-600">Predicted: {data.predicted}</div>
                                    <div className={`${getAccuracyColor(data.accuracy)}`}>
                                        Accuracy: {data.accuracy}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Predictions List */}
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        🔮 Prediction History
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {predictions.length > 0 ? (
                        <div className="space-y-4">
                            {predictions.map((prediction) => (
                                <div key={prediction._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium text-gray-800">
                                                {prediction.crop} • {prediction.season} {prediction.year}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Created: {new Date(prediction.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                prediction.status === 'active' ? 'bg-green-100 text-green-800' :
                                                prediction.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {prediction.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Predicted Yield */}
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-sm text-gray-600">Predicted Yield</p>
                                            <p className="text-lg font-semibold text-blue-600">
                                                {prediction.predictedYield?.value?.toLocaleString() || 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {prediction.predictedYield?.unit || 'kg/hectare'}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Confidence: {Math.round((prediction.confidenceMetrics?.confidence || 0) * 100)}%
                                            </p>
                                        </div>

                                        {/* Actual Yield */}
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <p className="text-sm text-gray-600">Actual Yield</p>
                                            {prediction.actualYield?.value ? (
                                                <>
                                                    <p className="text-lg font-semibold text-green-600">
                                                        {prediction.actualYield.value.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {prediction.actualYield.unit}
                                                    </p>
                                                    {prediction.accuracy && (
                                                        <p className={`text-xs mt-1 ${getAccuracyColor(prediction.accuracy * 100)}`}>
                                                            Accuracy: {Math.round(prediction.accuracy * 100)}%
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-lg font-medium text-gray-400">Not recorded</p>
                                                    <button
                                                        onClick={() => setShowActualYieldModal(prediction._id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                                    >
                                                        Add actual yield
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Model Info */}
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm text-gray-600">Model Info</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {prediction.modelType} v{prediction.modelVersion}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Source: {prediction.source}
                                            </p>
                                            {prediction.notes && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    {prediction.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Input Parameters */}
                                    {prediction.inputParameters && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 mb-2">Input Parameters:</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                {Object.entries(prediction.inputParameters).map(([key, value]) => (
                                                    <div key={key} className="bg-gray-100 rounded px-2 py-1">
                                                        <span className="font-medium">{key}:</span> {value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No Prediction History</h3>
                            <p className="text-gray-600 mb-4">
                                Start making predictions to see your history here
                            </p>
                            <button
                                onClick={() => window.location.href = '/predict'}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Create First Prediction
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* Actual Yield Modal */}
            {showActualYieldModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Add Actual Yield
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Actual Yield (kg/hectare)
                            </label>
                            <input
                                type="number"
                                value={actualYieldInput}
                                onChange={(e) => setActualYieldInput(e.target.value)}
                                placeholder="Enter actual yield"
                                min="0"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleActualYieldSubmit(showActualYieldModal)}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setShowActualYieldModal(null);
                                    setActualYieldInput('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default YieldHistory;