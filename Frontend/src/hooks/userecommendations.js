// src/hooks/useRecommendations.js

import { useState, useCallback } from 'react';
import { useAuth } from '../context/authcontext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Custom hook to fetch a list of prioritized recommendations.
 */
export const useRecommendations = () => {
    const { authToken } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRecommendations = useCallback(async () => {
        if (!authToken) {
            setError("Authentication token missing.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`, 
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch recommendations.');
            }

            const result = await response.json();
            setRecommendations(result.recommendations || []); 
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [authToken]);

    return { recommendations, isLoading, error, fetchRecommendations };
};