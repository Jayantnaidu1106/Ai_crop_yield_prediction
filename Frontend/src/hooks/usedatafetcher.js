// src/hooks/useDataFetcher.js

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Custom hook to fetch aggregated dashboard data or history data.
 * @param {string} endpointPath - The path for the specific data (/dashboard or /history).
 */
export const useDataFetcher = (endpointPath = '/dashboard') => {
    const { authToken } = useAuth();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!authToken) {
            setError("Authentication token missing.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/data${endpointPath}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`, 
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch data.`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error(`Error fetching data:`, err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [authToken, endpointPath]);

    return { data, isLoading, error, fetchData };
};