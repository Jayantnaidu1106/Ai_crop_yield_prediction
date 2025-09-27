// src/components/Auth/VerifyOTP.jsx

import React, { useState } from 'react';
import { useTwilioAuth } from '../../hooks/useTwilioAuth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
        <div className="verification-container">
            <h2>Verify Identity</h2>
            <p>Code sent to: <strong>{userNumber || 'your number'}</strong></p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.substring(0, 6))}
                    placeholder="------"
                    maxLength="6"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                </button>
            </form>
            <button onClick={onBack}>← Back / Resend OTP</button>
        </div>
    );
}

export default VerifyOTP;