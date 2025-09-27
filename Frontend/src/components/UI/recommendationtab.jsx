// src/components/common/RecommendationTab.jsx
import React, { useState } from 'react';
// import { useRecommendations } from '../../hooks/useRecommendations'; 

/**
 * Component to display actionable insights organized by category (tabs).
 * Used on the Dashboard page.
 * @param {array} recommendations - Array of recommendation objects from the backend.
 */
function RecommendationTab({ recommendations = [] }) {
    // State to control which tab is currently active
    const [activeTab, setActiveTab] = useState('Irrigation'); 
    
    // Group recommendations by their type for display
    const groupedRecs = recommendations.reduce((acc, rec) => {
        const type = rec.type || 'General'; // Assuming rec.type is 'Irrigation', 'Fertilization', etc.
        acc[type] = acc[type] ? [...acc[type], rec] : [rec];
        return acc;
    }, {});

    const tabs = ['Irrigation', 'Fertilization', 'Pest Control']; 

    return (
        <div className="recommendation-tabs-container">
            <div className="tab-buttons">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {(groupedRecs[activeTab] || []).length > 0 ? (
                    (groupedRecs[activeTab] || []).map((rec, index) => (
                        <div key={index} className="recommendation-item">
                            <p className={`priority-${rec.priority.toLowerCase()}`}>
                                **{rec.action}** </p>
                            <p className="detail">{rec.detail}</p>
                            <button className="mark-done-btn">Mark as Done</button>
                        </div>
                    ))
                ) : (
                    <p className="no-recs-msg">No {activeTab} actions currently required. Status: **Optimal**.</p>
                )}
            </div>
        </div>
    );
}

export default RecommendationTab;