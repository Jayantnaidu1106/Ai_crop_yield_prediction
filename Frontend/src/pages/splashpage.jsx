// src/pages/SplashPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import backgroundImage from '../assets/backgroundimg.jpg'; // Assuming the image is named backgroundimg.jpg

function SplashPage() {
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [selectedRegionalLanguage, setSelectedRegionalLanguage] = useState('हिन्दी');

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    const regionalLanguages = [
        { code: 'hi', name: 'हिन्दी' },
        { code: 'mr', name: 'मराठी' },
        { code: 'kn', name: 'ಕನ್ನಡ' }, // Corrected spelling for Kannada
        { code: 'te', name: 'తెలుగు' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'gu', name: 'ગુજરાતી' }
    ];

    const handleContinue = () => {
        localStorage.setItem('selectedLanguage', selectedLanguage);
        localStorage.setItem('selectedRegionalLanguage', selectedRegionalLanguage);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" // Removed gradient background classes
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>

            {/* Main Container (the card) */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto border border-white/20" // Adjusted opacity to 10% and blur to md
                 style={{
                     // Optional: If you want a very subtle transparency without white overlay
                     // If you set bg-transparent above, you might still want a slight tint
                     // backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                 }}>

                {/* Logo Section */}
                <div className="text-center mb-8">
                    {/* Logo Icon */}
                    <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                            <path d="M12 12C12 12 15 9 15 6.5C15 4.5 13.5 3 12 3S9 4.5 9 6.5C9 9 12 12 12 12Z" opacity="0.7"/>
                            <circle cx="12" cy="18" r="3" opacity="0.5"/>
                        </svg>
                    </div>

                    {/* App Title */}
                    <h1 className="text-3xl font-bold text-white mb-2 text-shadow"> {/* Changed text color to white for better contrast */}
                        KrishiMitra
                    </h1>
                    <p className="text-white text-lg font-medium text-shadow"> {/* Changed text color to white for better contrast */}
                        Data-Driven Farming
                    </p>
                </div>

                {/* Language Selection */}
                <div className="space-y-4 mb-8">
                    {/* Primary Language */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2 text-shadow"> {/* Changed text color to white */}
                            🌍 Primary Language
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white/20 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white" // Adjusted select background
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.name} className="text-gray-900"> {/* Options should be dark for readability */}
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Regional Language */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2 text-shadow"> {/* Changed text color to white */}
                            🏛️ Regional Language
                        </label>
                        <select
                            value={selectedRegionalLanguage}
                            onChange={(e) => setSelectedRegionalLanguage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white/20 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white" // Adjusted select background
                        >
                            {regionalLanguages.map((lang) => (
                                <option key={lang.code} value={lang.name} className="text-gray-900"> {/* Options should be dark for readability */}
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    Continue to App →
                </button>

                {/* Language selection notice */}
                <p className="text-center text-sm text-white mt-4 text-shadow"> {/* Changed text color to white */}
                    Select your preferred languages and continue
                </p>
            </div>

            {/* Decorative Elements - You might want to adjust their opacity or colors if they clash with the new background */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200/20 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-5 w-16 h-16 bg-emerald-200/20 rounded-full blur-lg"></div>
        </div>
    );
}

export default SplashPage;