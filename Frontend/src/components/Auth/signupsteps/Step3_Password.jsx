// src/components/Auth/SignUpSteps/Step3_Password.jsx
import React, { useState } from 'react';

function Step3_Password({ formData, submitFinalForm, prevStep }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        
        // Final Submission: Combine all steps' data and submit to the backend /signup endpoint
        const finalData = { ...formData, password };
        submitFinalForm(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="signup-step">
            <h2>3. Create Secure Password</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <input name="password" type="password" placeholder="Create Password" 
                   value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" 
                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            
            <ul className="password-requirements">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
            </ul>

            <div className="button-group">
                <button type="button" onClick={prevStep} className="secondary-button">← Back</button>
                <button type="submit" className="cta-button">Finish Setup</button>
            </div>
        </form>
    );
}

export default Step3_Password;