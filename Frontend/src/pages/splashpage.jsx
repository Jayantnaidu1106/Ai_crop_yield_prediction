// src/pages/SplashPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/UI/LanguageSelector';

// Import the assets (Ensure these paths are correct in your setup)
import splashBackground from '../assets/farm-background.jpg'; 
import krishiMitraLogo from '../assets/krishi-mitra-logo.jpg';

function SplashPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage, getCurrentLanguageDetails } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleProceed = async () => {
        setIsLoading(true);
        console.log(`Language selected: ${currentLanguage}. Proceeding to login.`);
        
        // Small delay for UX
        setTimeout(() => {
            navigate('/login');
            setIsLoading(false);
        }, 500);
    };



    // --- Main Page Render ---
    return (
        // Full Page Container with Background Image
        <div 
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-4" // Reduced overall padding
            style={{ backgroundImage: `url(${splashBackground})` }}
        >
            {/* Centered Card with Deep Glassmorphism (max-w-sm for reduced width) */}
            <div 
                className="w-full max-w-sm bg-white/10 backdrop-blur-2xl p-10 rounded-[30px] transition-all duration-700 ease-out 
                           border-2 border-white/40 
                           shadow-2xl shadow-black/30 
                           hover:shadow-4xl hover:bg-white/15"
                style={{
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), 0 0 30px rgba(255, 255, 255, 0.4) inset'
                }}
            >
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12"> {/* Reduced bottom margin */}
                    <img 
                        src={krishiMitraLogo} 
                        alt="KrishiMitra AI Logo" 
                        className="w-36 h-36 mb-4 rounded-full ring-4 ring-white/50 shadow-xl transition-all duration-500" // Slightly reduced logo size to match smaller card
                    />
                    
                    {/* Heading: Typography retained for impact */}
                    <h1 
                        className="text-5xl font-black text-white tracking-tight" // Adjusted size slightly
                        style={{
                            textShadow: '0 4px 15px rgba(0,0,0,0.6), 0 0 10px rgba(255,255,255,0.5)'
                        }}
                    >
                        {t('splash.welcomeTitle')}
                    </h1>
                    
                    {/* Tagline */}
                    <p 
                        className="text-lg text-white/95 font-semibold mt-2"
                        style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                    >
                        {t('splash.welcomeSubtitle')}
                    </p>
                </div>
                
                {/* Language Selector Section */}
                <div className="mb-10 w-full">
                    <div className="text-center mb-4">
                        <p className="text-white font-semibold text-lg mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {t('splash.selectLanguage')}
                        </p>
                    </div>
                    <LanguageSelector 
                        variant="splash" 
                        className="w-full" 
                        dropdownAlign="left"
                    />
                </div>
                
                {/* CTA Button */}
                <button 
                    onClick={handleProceed} 
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white font-black text-xl tracking-wide rounded-xl 
                                shadow-xl shadow-green-500/40 transition-all duration-300 ease-out 
                                transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('common.loading')}</span>
                        </div>
                    ) : (
                        t('splash.getStarted')
                    )}
                </button>
            </div>
        </div>
    );
}

export default SplashPage;