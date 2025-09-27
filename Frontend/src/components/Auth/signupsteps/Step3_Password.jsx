// src/components/Auth/SignUpSteps/Step3_OTPVerification.jsx
import React, { useState } from 'react';
import { useTwilioAuth } from '../../../hooks/usetwilioauth';
import { useNavigate } from 'react-router-dom';

function Step3_OTPVerification({ formData, submitFinalForm, prevStep }) {
    const navigate = useNavigate();
    const { sendOTP, verifyOTP } = useTwilioAuth();

    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Send OTP to the phone number from formData
    const handleSendOTP = async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const result = await sendOTP(formData.phoneNumber);
            if (result.success) {
                setSuccess('OTP sent successfully! Check your phone.');
                setOtpSent(true);
            } else {
                setError(result.error || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    // Verify OTP and complete signup
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!otpCode || otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP code');
            setIsLoading(false);
            return;
        }

        try {
            const result = await verifyOTP(otpCode);
            if (result.success) {
                setSuccess('Phone verified successfully! Creating your account...');

                // Submit the final form data to complete signup
                const finalData = {
                    ...formData,
                    phoneVerified: true,
                    verificationDate: new Date().toISOString()
                };

                // Call the parent's submit function
                await submitFinalForm(finalData);

                // Navigate to dashboard after successful signup
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

    // Auto-send OTP when component mounts
    React.useEffect(() => {
        if (!otpSent && formData.phoneNumber) {
            handleSendOTP();
        }
    }, []);

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
                    {/* Back Button */}
                    <button
                        onClick={prevStep}
                        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        ← Back
                    </button>

                    {/* Logo Icon */}
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                            <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white" opacity="0.8"/>
                        </svg>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center mb-4">
                        <div className="flex space-x-2">
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Verify Your Phone
                    </h1>
                    <p className="text-gray-600">
                        Step 3 of 3 - Almost done! {formData.phoneNumber && `We sent a code to ${formData.phoneNumber}`}
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
                {otpSent ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🔐 Enter OTP Code
                            </label>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                className="w-full p-4 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg text-center tracking-widest"
                                maxLength="6"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter the 6-digit code sent to your phone
                            </p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
                                disabled={isLoading}
                            >
                                ← Previous
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || otpCode.length !== 6}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Complete Signup →'
                                )}
                            </button>
                        </div>

                        {/* Resend OTP */}
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            className="w-full text-green-600 hover:text-green-700 font-medium py-2 transition-colors disabled:opacity-50"
                        >
                            Didn't receive code? Resend OTP
                        </button>
                    </form>
                ) : (
                    /* Sending OTP State */
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                            <span className="text-gray-600">Sending OTP to {formData.phoneNumber}...</span>
                        </div>

                        <button
                            onClick={prevStep}
                            className="w-full bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
                        >
                            ← Go Back
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        Step 3 of 3 - Secure verification to protect your account
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

export default Step3_OTPVerification;