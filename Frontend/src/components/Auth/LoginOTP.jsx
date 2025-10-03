// src/components/Auth/Login.jsx

import React, { useState } from 'react';
import { useTwilioAuth } from '../../hooks/useTwilioAuth';

// Ensure your assets are imported correctly as variables
import krishiMitraLogo from '../../assets/krishi-mitra-logo.jpg';
import backgroundImage from '../../assets/farm-background.jpg';

function Login({ onOTPSent }) {
    const { sendOTP } = useTwilioAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

        const result = await sendOTP(formattedPhoneNumber);

        if (result.success) {
            onOTPSent(true); // Transition to the VerifyOTP screen
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        // Outer Container: Applies background image
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            
            {/* Login Card Container: Glassmorphism Effect */}
            <div className="w-full max-w-sm bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 transition duration-500 ease-in-out hover:shadow-2xl">
                
                {/* Logo and Branding Area (Prominent) */}
                <div className="flex flex-col items-center mb-10">
                    <img 
                        src={krishiMitraLogo} 
                        alt="KrishiMitra AI Logo" 
                        className="w-32 h-32 mb-4 rounded-full shadow-lg border-2 border-white" 
                    />
                    <h1 className="text-3xl font-extrabold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
                        KrishiMitra AI
                    </h1>
                    <p className="text-sm text-white/90 font-medium [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)] mt-1">
                        Data-Driven Farming
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phone Number Input Group */}
                    <div className="flex border border-white/50 rounded-xl overflow-hidden bg-white/60 focus-within:ring-2 focus-within:ring-white">
                        
                        {/* Static Country Code Display */}
                        <span className="p-3 bg-white/80 text-gray-800 font-bold text-sm flex items-center shadow-inner">
                            +91
                        </span>
                        
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter Phone Number"
                            className="flex-grow p-3 text-gray-900 border-none outline-none bg-transparent placeholder-gray-600 transition duration-300"
                            required
                        />
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-300 font-medium text-left bg-red-800/60 p-2 rounded">
                            {error}
                        </p>
                    )}
                    
                    {/* Send OTP Button (Primary CTA) */}
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
                                <span>Sending...</span>
                            </div>
                        ) : 'Send OTP'}
                    </button>
                </form>

                {/* Sign Up Link - Restyled and simplified */}
                <div className="mt-8 pt-4 border-t border-white/50 text-center text-sm">
                    <p className="text-white/80 [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)]">
                        New user?
                        <a
                            href="/signup"
                            className="text-yellow-300 font-bold hover:text-yellow-200 ml-1 underline"
                        >
                            Register Here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;