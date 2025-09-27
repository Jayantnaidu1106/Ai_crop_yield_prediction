// src/components/Auth/Login.jsx

import React, { useState } from 'react';
import { useTwilioAuth } from '../../hooks/usetwilioauth';

function Login({ onOTPSent }) {
    const { sendOTP } = useTwilioAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await sendOTP(phoneNumber);

        if (result.success) {
            onOTPSent(true); // Transition to the VerifyOTP screen
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="login-container">
            <h2>Enter Your Phone Number</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    required
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
            </form>
            {/* Link to AuthPage Signup wrapper component */}
        </div>
    );
}

export default Login;