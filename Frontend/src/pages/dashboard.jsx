// src/pages/Dashboard.jsx

import React, { useEffect } from 'react';
import { useAuth } from '../context/authcontext';
import { useDataFetcher } from '../hooks/usedatafetcher';
import { useRecommendations } from '../hooks/userecommendations';
import PredictionCard from '../components/ML/PredictionCard';
import QuickPredictionForm from '../components/ML/QuickPredictionForm';
import AuthHelper from '../components/Debug/AuthHelper';

function Dashboard() {
    const { logout } = useAuth();
    const { data: dashboardData, fetchData: fetchDashboard, isLoading: loadingDashboard } = useDataFetcher();
    const { recommendations, fetchRecommendations, isLoading: loadingRecs } = useRecommendations();

    useEffect(() => {
        fetchDashboard();
        fetchRecommendations();
    }, [fetchDashboard, fetchRecommendations]);

    if (loadingDashboard || loadingRecs) {
        return <div className="loading">Loading AI Insights...</div>;
    }

    // Destructure key metrics for display (as shown in image)
    const predictedYield = dashboardData?.predictedYield || 'N/A';
    const cropHealth = dashboardData?.cropHealth || 'N/A';
    const nextAction = recommendations[0] || { type: 'None', action: 'Relax and Monitor' };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            🌾 Agrivision AI Dashboard
                        </h1>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Predicted Yield</h3>
                        <p className="text-3xl font-bold text-green-600">{predictedYield}</p>
                        <p className="text-sm text-gray-600">Quintals/Acre</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Crop Health Index</h3>
                        <p className="text-3xl font-bold text-blue-600">{cropHealth}/100</p>
                        <p className="text-sm text-gray-600">Health Score</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Action Due</h3>
                        <p className="text-lg font-medium text-orange-600">{nextAction.action}</p>
                        <p className="text-sm text-gray-600">Priority Action</p>
                    </div>
                </div>

                {/* ML Prediction Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <PredictionCard />
                    <QuickPredictionForm />
                </div>

                {/* Recommendations Section */}
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        💡 Actionable Recommendations
                    </h2>

                    {/* Recommendations List */}
                    <div className="space-y-4">
                        {recommendations && recommendations.length > 0 ? (
                            recommendations.map((rec, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{rec.type}</h4>
                                        <p className="text-gray-600">{rec.action}</p>
                                    </div>
                                    <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors">
                                        Mark as Done
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No recommendations available</p>
                                <p className="text-sm text-gray-400 mt-1">Check back later for AI-powered insights</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Debug Helper */}
            <AuthHelper />

            {/* Navigation Bar Placeholder */}
        </div>
    );
}

export default Dashboard;