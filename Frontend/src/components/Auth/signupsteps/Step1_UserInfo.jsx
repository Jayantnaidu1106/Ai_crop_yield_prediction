// src/components/Auth/SignUpSteps/Step1_UserInfo.jsx
import React, { useState } from 'react';
// import { useFormValidation } from '../../../hooks/useFormValidation'; 

function Step1_UserInfo({ formData, updateFormData, nextStep }) {
    const [localData, setLocalData] = useState(formData);
    // const { errors, validate } = useFormValidation(['name', 'email']); 

    const handleChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // if (validate(localData)) { // Example validation logic
        updateFormData(localData);
        nextStep();
        // }
    };

    return (
        <form onSubmit={handleSubmit} className="signup-step">
            <h2>1. Personal Details</h2>
            <input name="name" type="text" placeholder="Full Name" 
                   value={localData.name || ''} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email Address" 
                   value={localData.email || ''} onChange={handleChange} />
            <p>We'll use your phone for OTP login.</p>
            {/* Display errors here */}
            <button type="submit" className="cta-button">Next: Farm Setup</button>
        </form>
    );
}

export default Step1_UserInfo;