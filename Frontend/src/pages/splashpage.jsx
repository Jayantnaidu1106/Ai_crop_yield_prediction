// src/pages/SplashPage.jsx
import React from 'react';
import LanguageSelector from '../components/common/LanguageSelector';
import { useNavigate } from 'react-router-dom';

function SplashPage() {
    const navigate = useNavigate();

    // After selecting language, navigate to the main AuthPage
    const handleProceed = () => {
        // You would likely save the selected language here
        navigate('/login'); 
    };

    return (
        <div className="splash-container">
            <div className="splash-card">
                <div className="logo-section">
                    {/*  */}
                    <h1>Agrivision AI</h1>
                    <p>Data-Driven Farming</p>
                </div>
                
                <div className="language-section">
                    <LanguageSelector />
                </div>
                
                <button onClick={handleProceed} className="cta-button-large">
                    Continue
                </button>
            </div>
        </div>
    );
}

export default SplashPage;