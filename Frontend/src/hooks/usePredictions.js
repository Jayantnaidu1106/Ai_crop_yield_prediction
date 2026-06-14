import { useState, useCallback } from 'react';
import { makePrediction, getPredictionHistory, getAccuracyMetrics, runScenarioAnalysis, getApiInfo } from '../api/api';

export function usePredictions() {
  const [predictions, setPredictions] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const predict = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await makePrediction(data);
      setLatestPrediction(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getPredictionHistory(params);
      setPredictions(res.data.predictions || []);
      setTotal(res.data.total || 0);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccuracy = useCallback(async () => {
    try {
      const res = await getAccuracyMetrics();
      setAccuracy(res.data);
      return res.data;
    } catch { return null; }
  }, []);

  const fetchApiInfo = useCallback(async () => {
    try {
      const res = await getApiInfo();
      setApiInfo(res.data);
      return res.data;
    } catch { return null; }
  }, []);

  const analyze = useCallback(async (baseParams, scenarios) => {
    setLoading(true);
    try {
      const res = await runScenarioAnalysis({ base_params: baseParams, scenarios });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    predictions, latestPrediction, accuracy, apiInfo, loading, total,
    predict, fetchHistory, fetchAccuracy, fetchApiInfo, analyze,
    setLatestPrediction
  };
}
