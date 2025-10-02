// src/components/Auth/VerifyOTP.jsx

import React, { useState } from 'react';
import { useTwilioAuth } from '../../hooks/useTwilioAuth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import assets (ensure paths are correct)
import backgroundImage from '../../assets/farm-background.jpg';
import krishiMitraLogo from '../../assets/krishi-mitra-logo.jpg';

function VerifyOTP({ onBack }) {
    const navigate = useNavigate();
    const { verifyOTP } = useTwilioAuth();
    const { userNumber } = useAuth();
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await verifyOTP(otpCode);

        if (result.success) {
            navigate('/dashboard'); 
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        // Outer Container: Applies background image (same as Login page)
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            
            {/* Verification Card Container: Glassmorphism Effect */}
            <div className="w-full max-w-sm bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 transition duration-500 ease-in-out">
                
                {/* Logo and Branding Area (Replicating the Login screen's top section) */}
                <div className="flex flex-col items-center mb-10">
                    <img 
                        src={krishiMitraLogo} 
                        alt="KrishiMitra AI Logo" 
                        className="w-32 h-32 mb-4 rounded-full shadow-lg border-2 border-white" 
                    />
                    <h1 className="text-3xl font-extrabold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
                        KrishiMitra AI
                    </h1>
                </div>

                {/* Verification Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)]">
                        Verify Identity
                    </h2>
                    <p className="text-sm text-white/90 mt-2 [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                        Enter the code sent to: 
                        <strong className="text-yellow-300 ml-1">{userNumber || 'your number'}</strong>
                    </p>
                </div>

                {/* OTP Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* OTP Input Field */}
                    <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.substring(0, 6))}
                        placeholder="------"
                        maxLength="6"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        // Styling for OTP input
                        className="w-full p-4 text-center text-2xl tracking-widest font-mono text-gray-900 border border-white/50 rounded-xl bg-white/90 outline-none focus:ring-4 focus:ring-green-400 transition duration-300 shadow-md"
                    />
                    
                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-300 font-medium text-left bg-red-800/60 p-2 rounded">
                            {error}
                        </p>
                    )}
                    
                    {/* Verify Button (Primary CTA) */}
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-3 bg-green-700 text-white font-extrabold text-lg rounded-xl shadow-lg transition-all duration-300 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Verifying...</span>
                            </div>
                        ) : 'Verify & Proceed'}
                    </button>
                </form>

                {/* Back / Resend OTP Link */}
                <div className="mt-6 text-center">
                    <button 
                        onClick={onBack} 
                        className="text-white/80 text-sm hover:text-white/95 transition duration-200 focus:outline-none focus:ring-1 focus:ring-white/50"
                    >
                        ← Back / Resend OTP
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTP;