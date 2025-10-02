// src/components/Auth/SignUpSteps/Step1_UserInfo.jsx

import React, { useState } from 'react';

function Step1_UserInfo({ formData, updateFormData, nextStep }) {
    const [localData, setLocalData] = useState(formData);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalData({ ...localData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Format phone number with country code
        const formattedPhoneNumber = localData.phoneNumber.startsWith('+')
            ? localData.phoneNumber
            : `+91${localData.phoneNumber}`;

        try {
            // Send OTP to the phone number
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formattedPhoneNumber,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // OTP sent successfully, update form data and move to next step
                updateFormData({ ...localData, phoneNumber: formattedPhoneNumber });
                nextStep();
            } else {
                setError(data.message || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            console.error('Send OTP error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">Join Us!</h2>
                <p className="text-md text-white/90 mt-1 [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">Step 1 of 3: Your Contact</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-800/60 text-white border border-red-500 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            <input
                name="fullName"
                type="text"
                placeholder="Full Name"
                value={localData.fullName || ''}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                required
            />

            <div className="flex border border-white/50 rounded-xl overflow-hidden bg-white/80 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
                 <span className="p-3 bg-white/90 text-gray-700 font-medium text-sm flex items-center shadow-inner">
                    +91 🇮🇳
                </span>
                <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="Mobile Number"
                    value={localData.phoneNumber || ''}
                    onChange={handleChange}
                    className="flex-grow px-5 py-3 border-none outline-none bg-transparent text-gray-800"
                    required
                />
            </div>

            <div className="flex items-center space-x-3 bg-white/80 p-4 rounded-xl shadow-sm border border-white/50">
                <input
                    name="whatsappUpdates"
                    type="checkbox"
                    checked={localData.whatsappUpdates || false}
                    onChange={handleChange}
                    id="whatsapp-check"
                    className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="whatsapp-check" className="text-gray-700 select-none text-sm">
                    Receive WhatsApp updates
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-6 bg-green-700 text-white font-extrabold text-lg rounded-xl shadow-lg hover:bg-green-800 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending OTP...</span>
                    </div>
                ) : 'Send OTP'}
            </button>
        </form>
    );
}

export default Step1_UserInfo;