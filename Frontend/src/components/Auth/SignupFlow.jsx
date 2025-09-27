// src/components/Auth/SignupFlow.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1_UserInfo from './signupsteps/Step1_UserInfo';
import Step2_FarmSetup from './signupsteps/Step2_FarmSetup';
import Step3_OTPVerification from './signupsteps/Step3_Password';

function SignupFlow({ onBackToLogin }) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        farmSize: '',
        farmLocation: '',
        primaryCrop: '',
        phoneVerified: false
    });

    // Update form data from any step
    const updateFormData = (stepData) => {
        setFormData(prevData => ({ ...prevData, ...stepData }));
    };

    // Navigation functions
    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const goBackToLogin = () => {
        if (onBackToLogin) {
            onBackToLogin();
        } else {
            navigate('/login');
        }
    };

    // Final form submission (after OTP verification)
    const submitFinalForm = async (finalData) => {
        try {
            console.log('Final signup data:', finalData);
            
            // TODO: Send to your backend signup API
            // const response = await fetch('/api/auth/signup', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(finalData)
            // });
            
            // For now, just log success
            console.log('Signup completed successfully!');
            
            // The Step3 component will handle navigation to dashboard
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    // Render current step
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1_UserInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        onBack={goBackToLogin}
                    />
                );
            case 2:
                return (
                    <Step2_FarmSetup
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3_OTPVerification
                        formData={formData}
                        submitFinalForm={submitFinalForm}
                        prevStep={prevStep}
                    />
                );
            default:
                return (
                    <Step1_UserInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        onBack={goBackToLogin}
                    />
                );
        }
    };

    return (
        <div>
            {renderCurrentStep()}
        </div>
    );
}

export default SignupFlow;
