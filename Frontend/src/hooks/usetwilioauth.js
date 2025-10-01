// src/hooks/useTwilioAuth.js

import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useTwilioAuth = () => {
    const { login, setUserNumber, userNumber } = useAuth();
    
    // Step 1: Request OTP from backend
    const sendOTP = async (phoneNumber) => {
        if (!phoneNumber.match(/^\+\d{10,15}$/)) {
             return { success: false, error: 'Invalid phone number format (must be E.164, e.g., +91...)' };
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
            });

            const data = await response.json();
            
            if (data.success) {
                setUserNumber(phoneNumber.trim()); 
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Failed to send OTP. Try again later.' };
            }
        } catch (error) {
            console.error('Network Error during OTP request:', error);
            return { success: false, error: 'Network connection failed. Check server status.' };
        }
    };

    // Step 2: Verify the OTP code
    const verifyOTP = async (otpCode) => {
        if (!userNumber) return { success: false, error: 'Phone number session expired. Please re-enter.' };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: userNumber,
                    otpCode: otpCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Backend returns token in data.data.token
                const token = data.data?.token || data.token;
                login(token);
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Invalid or expired code. Check your SMS.' };
            }
        } catch (error) {
            console.error('Network Error during OTP verification:', error);
            return { success: false, error: 'Verification failed due to network.' };
        }
    };

    return { sendOTP, verifyOTP };
};