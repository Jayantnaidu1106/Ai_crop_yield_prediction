import { useState, useCallback } from 'react';
import { getRecommendations, getRecommendationsSummary } from '../api/api';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchRecommendations = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getRecommendations(params);
      setRecommendations(res.data.recommendations || []);
      setTotal(res.data.total || 0);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await getRecommendationsSummary();
      setSummary(res.data);
      return res.data;
    } catch { return null; }
  }, []);

  return { recommendations, summary, loading, total, fetchRecommendations, fetchSummary };
}
