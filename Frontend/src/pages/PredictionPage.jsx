import React, { useEffect } from 'react';
import { usePredictions } from '../hooks/usePredictions';
import PredictionForm from '../components/PredictionForm';
import PredictionCard from '../components/PredictionCard';
import RecommendationsPanel from '../components/RecommendationsPanel';
import ScenarioAnalysis from '../components/ScenarioAnalysis';

export default function PredictionPage() {
  const { latestPrediction, apiInfo, loading, predict, fetchApiInfo, analyze, setLatestPrediction } = usePredictions();

  useEffect(() => { fetchApiInfo(); }, []);

  const handlePredict = async (data) => {
    const result = await predict(data);
    setLatestPrediction(result);
    return result;
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Predict Yield</h1>
        <p>Enter crop and environmental data to get AI-powered yield predictions</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Prediction Input</h3>
          </div>
          <PredictionForm apiInfo={apiInfo} onPredict={handlePredict} loading={loading} />
        </div>

        {/* Results */}
        <div>
          <PredictionCard prediction={latestPrediction} />
          {latestPrediction?.recommendations?.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h3 className="card-title">Recommendations</h3>
                <span className="badge badge-amber">{latestPrediction.recommendations.length}</span>
              </div>
              <RecommendationsPanel recommendations={latestPrediction.recommendations} compact />
            </div>
          )}
        </div>
      </div>

      {/* Scenario Analysis */}
      <ScenarioAnalysis apiInfo={apiInfo} onAnalyze={analyze} loading={loading} />
    </div>
  );
}
