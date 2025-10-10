import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for ML-powered crop yield predictions
 * Integrates with the backend API that calls the ML service
 */
export const useMLPrediction = () => {
    const [prediction, setPrediction] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    /**
     * Create a new yield prediction using ML model
     */
    const createPrediction = useCallback(async (predictionData, authToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/predictions`,
                {
                    crop: predictionData.crop,
                    season: predictionData.season,
                    year: predictionData.year || new Date().getFullYear(),
                    farmSize: parseFloat(predictionData.farmSize),
                    soilType: predictionData.soilType,
                    irrigationType: predictionData.irrigationType,
                    seedVariety: predictionData.seedVariety,
                    fertilizers: predictionData.fertilizers || [],
                    pesticides: predictionData.pesticides || [],
                    weatherData: {
                        temperature: parseFloat(predictionData.temperature),
                        rainfall: parseFloat(predictionData.rainfall),
                        humidity: parseFloat(predictionData.humidity),
                        soilPh: parseFloat(predictionData.soilPh),
                        soilNitrogen: parseFloat(predictionData.soilNitrogen),
                        soilPhosphorus: parseFloat(predictionData.soilPhosphorus),
                        soilPotassium: parseFloat(predictionData.soilPotassium),
                        soilMoisture: parseFloat(predictionData.soilMoisture),
                        cropStage: predictionData.cropStage,
                        state: predictionData.state,
                        district: predictionData.district
                    },
                    farmingPractices: predictionData.farmingPractices || [],
                    marketPrice: predictionData.marketPrice ? parseFloat(predictionData.marketPrice) : null,
                    estimatedCost: predictionData.estimatedCost ? parseFloat(predictionData.estimatedCost) : null,
                    notes: predictionData.notes
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setPrediction(response.data.data.prediction);
                return {
                    success: true,
                    prediction: response.data.data.prediction
                };
            } else {
                throw new Error(response.data.message || 'Prediction failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create prediction';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Get user's predictions with filtering options
     */
    const getPredictions = useCallback(async (filters = {}, authToken) => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            
            if (filters.crop) queryParams.append('crop', filters.crop);
            if (filters.season) queryParams.append('season', filters.season);
            if (filters.year) queryParams.append('year', filters.year);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.offset) queryParams.append('offset', filters.offset);

            const response = await axios.get(
                `${API_BASE_URL}/predictions?${queryParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                return {
                    success: true,
                    predictions: response.data.data.predictions,
                    pagination: response.data.data.pagination
                };
            } else {
                throw new Error(response.data.message || 'Failed to fetch predictions');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch predictions';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Get a specific prediction by ID with recommendations
     */
    const getPredictionById = useCallback(async (predictionId, authToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${API_BASE_URL}/predictions/${predictionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                setPrediction(response.data.data.prediction);
                
                // Extract recommendations if available
                if (response.data.data.prediction.recommendationIds) {
                    setRecommendations(response.data.data.prediction.recommendationIds);
                }

                return {
                    success: true,
                    prediction: response.data.data.prediction
                };
            } else {
                throw new Error(response.data.message || 'Failed to fetch prediction');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch prediction';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Update prediction with actual yield after harvest
     */
    const updateActualYield = useCallback(async (predictionId, actualData, authToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.patch(
                `${API_BASE_URL}/predictions/${predictionId}/actual-yield`,
                {
                    actualYield: parseFloat(actualData.actualYield),
                    harvestDate: actualData.harvestDate,
                    harvestNotes: actualData.harvestNotes,
                    marketPriceActual: actualData.marketPriceActual ? parseFloat(actualData.marketPriceActual) : null
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setPrediction(prev => prev ? { ...prev, ...response.data.data.prediction } : null);
                return {
                    success: true,
                    prediction: response.data.data.prediction
                };
            } else {
                throw new Error(response.data.message || 'Failed to update actual yield');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update actual yield';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Get dashboard data with prediction statistics
     */
    const getDashboardData = useCallback(async (authToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${API_BASE_URL}/predictions/dashboard`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Clear current prediction and recommendations
     */
    const clearPrediction = useCallback(() => {
        setPrediction(null);
        setRecommendations([]);
        setError(null);
    }, []);

    /**
     * Get formatted prediction summary for display
     */
    const getPredictionSummary = useCallback((predictionData) => {
        if (!predictionData) return null;

        return {
            crop: predictionData.crop.charAt(0).toUpperCase() + predictionData.crop.slice(1),
            season: predictionData.season.charAt(0).toUpperCase() + predictionData.season.slice(1),
            predictedYield: `${predictionData.predictedYield} quintals`,
            confidence: `${(predictionData.confidenceScore * 100).toFixed(1)}%`,
            status: predictionData.status,
            accuracy: predictionData.actualYield ? 
                `${(100 - Math.abs((predictionData.predictedYield - predictionData.actualYield) / predictionData.actualYield) * 100).toFixed(1)}%` : 
                'N/A',
            roi: predictionData.roi ? `${predictionData.roi.toFixed(2)}%` : 'N/A',
            createdAt: new Date(predictionData.createdAt).toLocaleDateString()
        };
    }, []);

    return {
        // State
        prediction,
        recommendations,
        loading,
        error,

        // Actions
        createPrediction,
        getPredictions,
        getPredictionById,
        updateActualYield,
        getDashboardData,
        clearPrediction,

        // Utilities
        getPredictionSummary
    };
};