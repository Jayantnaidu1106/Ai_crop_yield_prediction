// src/pages/SignUpPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/authcontext';
import { useTwilioAuth } from '../hooks/useTwilioAuth';
import Step1_UserInfo from '../components/Auth/signupsteps/Step1_UserInfo';
import Step2_VerifyOTP from '../components/Auth/signupsteps/Step2_VerifyOTP';
import Step3_FarmSetup from '../components/Auth/signupsteps/Step3_Password';
import backgroundImage from '../assets/farm-background.jpg';
import krishiMitraLogo from '../assets/krishi-mitra-logo.jpg';

function SignUpPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { updateFarmLocation } = useAuth();
    const { completeRegistration } = useTwilioAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '', // <--- NEW FIELD: Using phone number for signup
        whatsappUpdates: false,
        farmSize: '',
        farmLocation: '',
        primaryCrop: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ... (updateFormData, nextStep, prevStep, handleBackToLogin functions remain the same)
    const updateFormData = (newData) => setFormData({ ...formData, ...newData });
    const nextStep = () => setCurrentStep(currentStep + 1);
    const prevStep = () => setCurrentStep(currentStep - 1);
    const handleBackToLogin = () => navigate('/login');

    // Final form submission using new registration flow
    const submitFinalForm = async (finalData) => {
        setError('');
        setIsLoading(true);

        try {
            // Use the new registration completion method
            const result = await completeRegistration(finalData);

            if (result.success) {
                // Save farm location to auth context
                if (finalData.farmLocation) {
                    updateFarmLocation(finalData.farmLocation);
                }
                
                // User is automatically logged in after successful registration
                alert('Registration successful! Welcome to KrishiMitra AI!');
                navigate('/dashboard'); 
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                // Step 1: User Info (Name + Phone) - Sends OTP
                return (<Step1_UserInfo formData={formData} updateFormData={updateFormData} nextStep={nextStep} />);
            case 2:
                // Step 2: Verify OTP
                return (<Step2_VerifyOTP formData={formData} nextStep={nextStep} prevStep={prevStep} />);
            case 3:
                // Step 3: Farm Setup (Final step)
                return (<Step3_FarmSetup formData={formData} updateFormData={updateFormData} submitFinalForm={submitFinalForm} prevStep={prevStep} />);
            default:
                return (<Step1_UserInfo formData={formData} updateFormData={updateFormData} nextStep={nextStep} />);
        }
    };

    return (
        // Outer Container: Applies background image
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {/* Signup Card Container: Glassmorphism Effect */}
            <div 
                className="w-full max-w-md bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-white/30"
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
            >
                
                {/* Logo and Branding Area */}
                <div className="flex flex-col items-center mb-8">
                    <img 
                        src={krishiMitraLogo} 
                        alt="KrishiMitra AI Logo" 
                        className="w-20 h-20 mb-3 rounded-full shadow-lg border-2 border-white" 
                    />
                    <h1 className="text-2xl font-bold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">KrishiMitra AI</h1>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
                                    step <= currentStep ? 'bg-green-600 shadow-md' : 'bg-gray-300/50'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-center text-sm text-white/90 font-medium [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                        Step {currentStep} of 3
                    </p>
                </div>

                {/* Error & Loading Messages */}
                {error && (<div className="mb-4 p-3 bg-red-800/60 text-white border border-red-500 rounded-lg text-sm font-medium">{error}</div>)}
                {isLoading && (
                    <div className="mb-4 p-3 bg-blue-800/60 text-white rounded-lg text-sm flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating account...
                    </div>
                )}

                {/* Render Current Step Component */}
                {renderStep()}

                {/* Back to Login Link (Only on Step 1) */}
                {currentStep === 1 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleBackToLogin}
                            className="text-sm text-white/80 hover:text-white font-medium transition duration-150 [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]"
                        >
                            ← Already have an account? Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SignUpPage;