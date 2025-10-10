// src/hooks/useTwilioAuth.js

import { useAuth } from '../context/authcontext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useTwilioAuth = () => {
    const { login, setUserNumber, userNumber, updateUserProfile } = useAuth();
    
    // Step 1: Request OTP for Login (existing users)
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
                return { success: true, userExists: data.data.userExists };
            } else {
                // User not found - suggest registration
                if (response.status === 404) {
                    return { 
                        success: false, 
                        error: data.message, 
                        userExists: false,
                        needsRegistration: true 
                    };
                }
                return { success: false, error: data.message || 'Failed to send OTP. Try again later.' };
            }
        } catch (error) {
            console.error('Network Error during OTP request:', error);
            return { success: false, error: 'Network connection failed. Check server status.' };
        }
    };

    // Send OTP for Registration (new users)
    const sendOTPForRegistration = async (phoneNumber) => {
        if (!phoneNumber.match(/^\+\d{10,15}$/)) {
             return { success: false, error: 'Invalid phone number format (must be E.164, e.g., +91...)' };
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/send-otp-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
            });

            const data = await response.json();
            
            if (data.success) {
                setUserNumber(phoneNumber.trim()); 
                return { success: true, userExists: false };
            } else {
                // User already exists - suggest login
                if (response.status === 409) {
                    return { 
                        success: false, 
                        error: data.message, 
                        userExists: true,
                        needsLogin: true 
                    };
                }
                return { success: false, error: data.message || 'Failed to send OTP. Try again later.' };
            }
        } catch (error) {
            console.error('Network Error during registration OTP request:', error);
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
                const userData = data.data?.user || null;
                
                // Login with token and user data
                login(token, userData);
                
                // If we have user data, update profile context
                if (userData) {
                    updateUserProfile(userData);
                }
                
                return { success: true, userData };
            } else {
                return { success: false, error: data.message || 'Invalid or expired code. Check your SMS.' };
            }
        } catch (error) {
            console.error('Network Error during OTP verification:', error);
            return { success: false, error: 'Verification failed due to network.' };
        }
    };

    // Verify OTP for Registration
    const verifyOTPForRegistration = async (otpCode) => {
        if (!userNumber) return { success: false, error: 'Phone number session expired. Please re-enter.' };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: userNumber,
                    otpCode: otpCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, readyForRegistration: true };
            } else {
                return { success: false, error: data.message || 'Invalid or expired code. Check your SMS.' };
            }
        } catch (error) {
            console.error('Network Error during registration OTP verification:', error);
            return { success: false, error: 'Verification failed due to network.' };
        }
    };

    // Complete Registration
    const completeRegistration = async (registrationData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: userNumber,
                    ...registrationData
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Backend returns token and user data
                const token = data.data?.token || data.token;
                const userData = data.data?.user || null;
                
                // Login with token and user data
                login(token, userData);
                
                // If we have user data, update profile context
                if (userData) {
                    updateUserProfile(userData);
                }
                
                return { success: true, userData };
            } else {
                return { success: false, error: data.message || 'Registration failed. Please try again.' };
            }
        } catch (error) {
            console.error('Network Error during registration:', error);
            return { success: false, error: 'Registration failed due to network.' };
        }
    };

    return { 
        sendOTP, 
        verifyOTP, 
        sendOTPForRegistration, 
        verifyOTPForRegistration, 
        completeRegistration 
    };
};