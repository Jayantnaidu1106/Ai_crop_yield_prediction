// src/pages/Dashboard.jsx

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDataFetcher } from '../hooks/usedatafetcher';
import { useRecommendations } from '../hooks/userecommendations';

function Dashboard() {
    const { logout } = useAuth();
    const { data: metrics, fetchData: fetchMetrics, isLoading: loadingMetrics } = useDataFetcher();
    const { recommendations, fetchRecommendations, isLoading: loadingRecs } = useRecommendations();

    useEffect(() => {
        fetchMetrics();
        fetchRecommendations();
    }, [fetchMetrics, fetchRecommendations]);

    if (loadingMetrics || loadingRecs) {
        return <div className="loading">Loading AI Insights...</div>;
    }
    
    // Destructure key metrics for display (as shown in image)
    const predictedYield = metrics.predictedYield || 'N/A';
    const cropHealth = metrics.cropHealth || 'N/A';
    const nextAction = recommendations[0] || { type: 'None', action: 'Relax and Monitor' };

    return (
        <div className="dashboard-container">
            <header>
                <h1>Agrivision AI Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </header>

            <section className="metric-cards">
                <div className="card">
                    <h3>Predicted Yield</h3>
                    <p>{predictedYield} Quintals/Acre</p>
                </div>
                <div className="card">
                    <h3>Crop Health Index</h3>
                    <p>{cropHealth}/100</p>
                </div>
                <div className="card primary-action">
                    <h3>Next Action Due</h3>
                    <p>{nextAction.action}</p>
                </div>
            </section>

            <section className="recommendations-list">
                <h2>Actionable Recommendations</h2>
                {/* Render Recommendation Tabs and details here */}
                {recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                        <strong>{rec.type}:</strong> {rec.action} 
                        <button className="mark-done">Mark as Done</button>
                    </div>
                ))}
            </section>

            {/* Navigation Bar Placeholder */}
        </div>
    );
}

export default Dashboard;