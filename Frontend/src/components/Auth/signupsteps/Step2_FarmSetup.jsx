// src/components/Auth/SignUpSteps/Step2_FarmSetup.jsx
import React, { useState } from 'react';

function Step2_FarmSetup({ formData, updateFormData, nextStep, prevStep }) {
    const [localData, setLocalData] = useState(formData);
    // Uses local state to manage the specific farm inputs

    const handleChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateFormData(localData);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit} className="signup-step">
            <h2>2. Farm Location & Crop</h2>
            <input name="farmSize" type="number" placeholder="Farm Size (Acres)" 
                   value={localData.farmSize || ''} onChange={handleChange} required />
            
            <select name="primaryCrop" onChange={handleChange} required>
                <option value="">Select Primary Crop</option>
                <option value="rice">Rice</option>
                <option value="wheat">Wheat</option>
                {/* Dynamically load from backend API later */}
            </select>
            
            {/* Placeholder for map selection component */}
            <div className="map-placeholder">[Map Component for Location Pin]</div>

            <div className="button-group">
                <button type="button" onClick={prevStep} className="secondary-button">← Back</button>
                <button type="submit" className="cta-button">Next: Create Password</button>
            </div>
        </form>
    );
}

export default Step2_FarmSetup;