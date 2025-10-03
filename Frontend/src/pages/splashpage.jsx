// src/pages/SplashPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the assets (Ensure these paths are correct in your setup)
import splashBackground from '../assets/farm-background.jpg'; 
import krishiMitraLogo from '../assets/krishi-mitra-logo.jpg'; 

// Define the available languages for the selector component
const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '' },
    { code: 'mr', name: 'मराठी', flag: '' },
    { code: 'te', name: 'తెలుగు', flag: '' } 
];

function SplashPage() {
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const handleProceed = () => {
        console.log(`Language selected: ${selectedLanguage}. Proceeding to login.`);
        // Store selected language in localStorage for later use
        localStorage.setItem('selectedLanguage', selectedLanguage);
        navigate('/login'); 
    };

    // --- Language Selector Component ---
    const LanguageSelector = () => (
        <div className="w-full space-y-3"> {/* Slightly reduced vertical space */}
            {/* Primary (English) Dropdown - Premium Glass Style */}
            <div className="relative w-full bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-xl shadow-lg transition-all duration-300 hover:bg-white/30">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="appearance-none w-full p-4 text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer rounded-xl"
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
                {/* Custom Down Arrow Icon */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Secondary Language Row (Inline display for regional languages) */}
            <div className="flex justify-between space-x-2 p-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl shadow-lg">
                {['hi', 'mr', 'te'].map(code => {
                    const lang = LANGUAGES.find(l => l.code === code);
                    return (
                        <button
                            key={code}
                            onClick={() => setSelectedLanguage(code)}
                            className={`flex-1 p-3 text-md font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.03] ${
                                selectedLanguage === code
                                    ? 'bg-green-600 text-white shadow-md border-2 border-white/50'
                                    : 'text-gray-800 bg-white/40 hover:bg-white/50'
                            }`}
                        >
                            {lang.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );

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
                        KrishiMitra AI
                    </h1>
                    
                    {/* Tagline */}
                    <p 
                        className="text-lg text-white/95 font-semibold mt-2"
                        style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                    >
                        Data-Driven Farming
                    </p>
                </div>
                
                {/* Language Selector Section */}
                <div className="mb-10 w-full">
                    <LanguageSelector />
                </div>
                
                {/* CTA Button */}
                <button 
                    onClick={handleProceed} 
                    className="w-full py-4 bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white font-black text-xl tracking-wide rounded-xl 
                                shadow-xl shadow-green-500/40 transition-all duration-300 ease-out 
                                transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
                >
                    Proceed
                </button>
            </div>
        </div>
    );
}

export default SplashPage;