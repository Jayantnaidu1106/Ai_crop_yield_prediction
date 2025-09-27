// src/components/Auth/VerifyOTP.jsx

import React, { useState, useEffect } from 'react';
import { useTwilioAuth } from '../../hooks/useTwilioAuth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/backgroundimg.jpg';

function VerifyOTP({ onBack, phoneNumber }) {
    const navigate = useNavigate();
    const { verifyOTP, sendOTP } = useTwilioAuth();
    const { userNumber } = useAuth();
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Use phoneNumber prop or userNumber from context
    const displayNumber = phoneNumber || userNumber;

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle OTP verification
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validate OTP format
        if (!otpCode || otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP code');
            setIsLoading(false);
            return;
        }

        try {
            const result = await verifyOTP(otpCode);

            if (result.success) {
                setSuccess('Verification successful! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setError(result.error || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setError('');
        setSuccess('');
        setIsResending(true);

        try {
            const result = await sendOTP(displayNumber);
            if (result.success) {
                setSuccess('New OTP sent successfully!');
                setCountdown(60); // 60 second cooldown
                setOtpCode(''); // Clear current OTP
            } else {
                setError(result.error || 'Failed to resend OTP. Please try again.');
            }
        } catch (err) {
            setError('Failed to resend OTP. Please check your connection.');
        } finally {
            setIsResending(false);
        }
    };

    // Handle OTP input (only numbers, max 6 digits)
    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtpCode(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 flex items-center justify-center p-4"
            style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover', 
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
}}>

            {/* Main Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto border border-white/20">

                {/* Header Section */}
                <div className="text-center mb-8">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            ← Back
                        </button>
                    )}

                    {/* Logo Icon */}
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                            <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white" opacity="0.8"/>
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Verify Your Phone
                    </h1>
                    <p className="text-gray-600">
                        We sent a 6-digit code to
                    </p>
                    <p className="text-green-600 font-semibold text-lg">
                        {displayNumber || 'your phone number'}
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

                {/* OTP Verification Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔐 Enter Verification Code
                        </label>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={handleOtpChange}
                            placeholder="123456"
                            className="w-full p-4 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg text-center tracking-widest font-mono"
                            maxLength="6"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the 6-digit code sent to your phone
                        </p>
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={isLoading || otpCode.length !== 6}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Verifying...
                            </div>
                        ) : (
                            'Verify & Continue →'
                        )}
                    </button>
                </form>

                {/* Resend OTP Section */}
                <div className="text-center mt-6 space-y-3">
                    <p className="text-sm text-gray-600">
                        Didn't receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isResending}
                        className="text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                Sending...
                            </div>
                        ) : countdown > 0 ? (
                            `Resend in ${countdown}s`
                        ) : (
                            'Resend OTP'
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        Check your SMS messages for the verification code
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

export default VerifyOTP;