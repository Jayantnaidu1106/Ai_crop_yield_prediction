// src/components/Auth/SignUpSteps/Step2_VerifyOTP.jsx

import React, { useState } from 'react';

function Step2_VerifyOTP({ formData, nextStep, prevStep }) {
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formData.phoneNumber,
                    otpCode: otpCode,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // OTP verified successfully, proceed to next step
                nextStep();
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            console.error('OTP verification error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setIsResending(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formData.phoneNumber,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('OTP resent successfully! Please check your phone.');
            } else {
                setError(data.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Resend OTP error:', err);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <form onSubmit={handleVerifyOTP} className="w-full space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
                    Verify Your Number
                </h2>
                <p className="text-sm text-white/90 mt-2 [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                    Step 2 of 3: Enter the OTP sent to
                </p>
                <p className="text-md font-semibold text-yellow-300 mt-1 [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)]">
                    {formData.phoneNumber}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-800/60 text-white border border-red-500 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/90 [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                    Enter OTP Code
                </label>
                <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-5 py-3 text-center text-2xl font-bold tracking-widest border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                    required
                />
                <p className="text-xs text-white/70 text-center [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                    Enter the 6-digit code sent to your phone
                </p>
            </div>

            {/* Resend OTP Link */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-sm text-yellow-300 hover:text-yellow-200 font-semibold transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)]"
                >
                    {isResending ? 'Resending...' : "Didn't receive code? Resend OTP"}
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between space-x-4 pt-4">
                <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 text-white font-bold rounded-xl border-2 border-white/50 bg-white/10 hover:bg-white/20 transition duration-150 shadow-md [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]"
                >
                    ← Back
                </button>
                <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="flex-1 py-3 bg-green-700 text-white font-extrabold rounded-xl shadow-lg hover:bg-green-800 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Verifying...</span>
                        </div>
                    ) : 'Verify & Continue'}
                </button>
            </div>
        </form>
    );
}

export default Step2_VerifyOTP;

