// src/pages/AuthPage.jsx

import React, { useState } from 'react';
import Login from '../components/Auth/LoginOTP';
import VerifyOTP from '../components/Auth/verifyotp';
// Placeholder for the main multi-step signup component
const SignUp = () => <div>Signup Flow Placeholder</div>; 

function AuthPage() {
    // State to manage the user's progress through the flow
    const [flow, setFlow] = useState('login'); // 'login', 'verify', 'signup'
    
    // Handles returning to login, which can also trigger resend logic
    const handleBack = () => setFlow('login'); 

    const renderFlow = () => {
        switch (flow) {
            case 'login':
                return <Login onOTPSent={() => setFlow('verify')} />;
            case 'verify':
                return <VerifyOTP onBack={handleBack} />;
            case 'signup':
                return <SignUp />;
            default:
                return <Login onOTPSent={() => setFlow('verify')} />;
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card">
                <p>Welcome! New user? <button onClick={() => setFlow('signup')}>Sign Up</button></p>
                {renderFlow()}
            </div>
        </div>
    );
}

export default AuthPage;