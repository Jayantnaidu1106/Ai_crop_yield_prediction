// src/components/Auth/SignUpSteps/Step1_UserInfo.jsx
import React, { useState } from 'react';


function Step1_UserInfo({ formData, updateFormData, nextStep, onBack }) {
    const [localData, setLocalData] = useState({
        fullName: formData.fullName || '',
        phoneNumber: formData.phoneNumber || '',
        ...formData
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalData({ ...localData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Full name validation
        if (!localData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (localData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        // Phone number validation
        if (!localData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!localData.phoneNumber.match(/^\+\d{10,15}$/)) {
            newErrors.phoneNumber = 'Please enter a valid phone number with country code (e.g., +919876543210)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            updateFormData(localData);
            nextStep();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 flex items-center justify-center p-4"
             style={{
                 backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="farm" patternUnits="userSpaceOnUse" width="100" height="100"><rect width="100" height="100" fill="%23f7fafc"/><path d="M0 100L50 50L100 100" stroke="%23e2e8f0" stroke-width="1" fill="none" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(%23farm)"/></svg>')`,
                 backgroundSize: '200px 200px'
             }}>

            {/* Main Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto border border-white/20">

                {/* Header Section */}
                <div className="text-center mb-8">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            ← Back to Login
                        </button>
                    )}

                    {/* Logo Icon */}
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center mb-4">
                        <div className="flex space-x-2">
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                            <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Personal Information
                    </h1>
                    <p className="text-gray-600">
                        Step 1 of 3 - Tell us about yourself
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            👤 Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={localData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={`w-full p-4 border rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                errors.fullName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📱 Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={localData.phoneNumber}
                            onChange={handleChange}
                            placeholder="+919876543210"
                            className={`w-full p-4 border rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Include country code (e.g., +91 for India)
                        </p>
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700 text-sm">
                            💡 We'll use your phone number for secure OTP authentication
                        </p>
                    </div>

                    {/* Next Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Next: Farm Details →
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={onBack}
                            className="text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                            Sign In
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        Step 1 of 3 - Your information is secure with us
                    </p>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 right-5 w-16 h-16 bg-emerald-200/30 rounded-full blur-lg"></div>
        </div>
    );
}

export default Step1_UserInfo;