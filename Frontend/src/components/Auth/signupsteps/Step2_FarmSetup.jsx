// src/components/Auth/SignUpSteps/Step2_VerifyOTP.jsx

import React, { useState, useEffect } from 'react';
import { useTwilioAuth } from '../../../hooks/useTwilioAuth';
import { useAuth } from '../../../context/AuthContext';

function Step2_VerifyOTP({ formData, nextStep, prevStep }) {
    const { userNumber } = useAuth();
    const { sendOTP, verifyOTP } = useTwilioAuth();
    
    const phoneNumber = formData.phoneNumber;

    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOTPSent, setIsOTPSent] = useState(false);

    // Effect to auto-trigger OTP send when component loads
    useEffect(() => {
        if (!isOTPSent) {
            handleSendOTP();
        }
    }, [isOTPSent]); 

    const handleSendOTP = async () => {
        setError('');
        setIsLoading(true);
        // Note: We skip the check in the hook here and call the service directly
        const result = await sendOTP(phoneNumber); 

        if (result.success) {
            setIsOTPSent(true);
            alert("Verification code resent!");
        } else {
            setError(result.error || "Failed to send code. Check number.");
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // We use the same verifyOTP logic as the login page
        const result = await verifyOTP(otpCode); 

        if (result.success) {
            // Success! The phone number is verified. Now move to farm details.
            nextStep();
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Step 2 of 3: Verify Phone</h2>
                <p className="text-md text-gray-500 mt-1">Code sent to: <strong className='text-green-600'>{phoneNumber}</strong></p>
            </div>

            {/* OTP Input Field */}
            <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.substring(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength="6"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full px-5 py-3 text-center border-2 border-gray-300 rounded-xl text-xl font-mono focus:border-green-500 shadow-sm"
                required
            />
            
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            
            <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-4 bg-green-700 text-white font-extrabold text-lg rounded-xl shadow-lg hover:bg-green-800 transition duration-200"
            >
                {isLoading ? 'Verifying...' : 'Confirm and Continue'}
            </button>
            
            <div className="flex justify-between space-x-4 pt-2">
                <button 
                    type="button" 
                    onClick={prevStep} 
                    className="py-3 text-gray-700 font-bold hover:text-green-600 transition duration-150"
                >
                    ← Back (Change Number)
                </button>
                <button 
                    type="button" 
                    onClick={handleSendOTP} 
                    disabled={isLoading}
                    className="py-3 text-sm text-green-600 font-bold hover:text-green-700 transition duration-150"
                >
                    Resend Code
                </button>
            </div>
        </form>
    );
}

export default Step2_VerifyOTP;