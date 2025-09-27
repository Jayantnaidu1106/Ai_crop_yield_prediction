// src/pages/AuthPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwilioAuth } from '../hooks/usetwilioauth';
import SignupFlow from '../components/Auth/SignupFlow';
import VerifyOTP from '../components/Auth/verifyotp';

function AuthPage() {
    const navigate = useNavigate();
    const { sendOTP, verifyOTP } = useTwilioAuth();

    // State management
    const [mode, setMode] = useState('login'); // 'login', 'signup'
    const [flow, setFlow] = useState('login'); // 'login', 'verify'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle phone number submission
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validate phone number format
        if (!phoneNumber.match(/^\+\d{10,15}$/)) {
            setError('Please enter a valid phone number with country code (e.g., +919876543210)');
            setIsLoading(false);
            return;
        }

        try {
            const result = await sendOTP(phoneNumber);
            if (result.success) {
                setSuccess('OTP sent successfully! Check your phone.');
                setFlow('verify');
            } else {
                setError(result.error || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };



    // Handle back to phone number entry
    const handleBack = () => {
        setFlow('login');
        setError('');
        setSuccess('');
    };

    // Handle back to login from signup
    const handleBackToLogin = () => {
        setMode('login');
        setFlow('login');
        setError('');
        setSuccess('');
    };

    // If signup mode, render the signup flow
    if (mode === 'signup') {
        return <SignupFlow onBackToLogin={handleBackToLogin} />;
    }

    // If verify mode, render the VerifyOTP component
    if (flow === 'verify') {
        return <VerifyOTP onBack={handleBack} phoneNumber={phoneNumber} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 flex items-center justify-center p-4"
             style={{
                 backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="farm" patternUnits="userSpaceOnUse" width="100" height="100"><rect width="100" height="100" fill="%23f7fafc"/><path d="M0 100L50 50L100 100" stroke="%23e2e8f0" stroke-width="1" fill="none" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(%23farm)"/></svg>')`,
                 backgroundSize: '200px 200px'
             }}>

            {/* Main Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto border border-white/20">

                {/* Header Section */}
                <div className="text-center mb-8">
                    {/* Back Button (only show in verify flow) */}
                    {flow === 'verify' && (
                        <button
                            onClick={handleBack}
                            className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            ← Back
                        </button>
                    )}

                    {/* Logo Icon */}
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                            <path d="M12 12C12 12 15 9 15 6.5C15 4.5 13.5 3 12 3S9 4.5 9 6.5C9 9 12 12 12 12Z" opacity="0.7"/>
                            <circle cx="12" cy="18" r="3" opacity="0.5"/>
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {flow === 'login' ? 'Welcome Back!' : 'Verify Your Phone'}
                    </h1>
                    <p className="text-gray-600">
                        {flow === 'login'
                            ? 'Enter your phone number to get started'
                            : `We sent a code to ${phoneNumber}`
                        }
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {/* Login Form - Phone Number */}
                {flow === 'login' && (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📱 Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+919876543210"
                                className="w-full p-4 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Include country code (e.g., +91 for India)
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !phoneNumber}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Sending OTP...
                                </div>
                            ) : (
                                'Send OTP →'
                            )}
                        </button>
                    </form>
                )}



                {/* Signup Link */}
                {flow === 'login' && (
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            New to Agrivision AI?{' '}
                            <button
                                onClick={() => setMode('signup')}
                                className="text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                Create Account
                            </button>
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        By continuing, you agree to our Terms of Service
                    </p>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 right-5 w-16 h-16 bg-emerald-200/30 rounded-full blur-lg"></div>
        </div>
    );
}

export default AuthPage;