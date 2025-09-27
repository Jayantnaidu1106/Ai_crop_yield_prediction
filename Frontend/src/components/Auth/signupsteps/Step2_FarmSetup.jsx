// src/components/Auth/SignUpSteps/Step2_FarmSetup.jsx
import React, { useState } from 'react';

function Step2_FarmSetup({ formData, updateFormData, nextStep, prevStep }) {
    const [localData, setLocalData] = useState({
        farmSize: formData.farmSize || '',
        farmLocation: formData.farmLocation || '',
        primaryCrop: formData.primaryCrop || '',
        ...formData
    });
    const [errors, setErrors] = useState({});

    const crops = [
        { value: 'rice', label: '🌾 Rice', icon: '🌾' },
        { value: 'wheat', label: '🌾 Wheat', icon: '🌾' },
        { value: 'corn', label: '🌽 Corn', icon: '🌽' },
        { value: 'cotton', label: '🌿 Cotton', icon: '🌿' },
        { value: 'sugarcane', label: '🎋 Sugarcane', icon: '🎋' },
        { value: 'soybean', label: '🫘 Soybean', icon: '🫘' },
        { value: 'tomato', label: '🍅 Tomato', icon: '🍅' },
        { value: 'potato', label: '🥔 Potato', icon: '🥔' },
        { value: 'onion', label: '🧅 Onion', icon: '🧅' },
        { value: 'other', label: '🌱 Other', icon: '🌱' }
    ];

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

        // Farm size validation
        if (!localData.farmSize) {
            newErrors.farmSize = 'Farm size is required';
        } else if (localData.farmSize <= 0) {
            newErrors.farmSize = 'Farm size must be greater than 0';
        } else if (localData.farmSize > 10000) {
            newErrors.farmSize = 'Please enter a realistic farm size';
        }

        // Farm location validation
        if (!localData.farmLocation.trim()) {
            newErrors.farmLocation = 'Farm location is required';
        } else if (localData.farmLocation.trim().length < 3) {
            newErrors.farmLocation = 'Please enter a valid location';
        }

        // Primary crop validation
        if (!localData.primaryCrop) {
            newErrors.primaryCrop = 'Please select your primary crop';
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
                    <button
                        onClick={prevStep}
                        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        ← Back
                    </button>

                    {/* Logo Icon */}
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9l-6.91 1.01L12 16l-3.09-6.99L2 9l6.91-.74L12 2z"/>
                            <path d="M19 21H5a2 2 0 01-2-2v-8h18v8a2 2 0 01-2 2z" opacity="0.7"/>
                        </svg>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center mb-4">
                        <div className="flex space-x-2">
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Farm Details
                    </h1>
                    <p className="text-gray-600">
                        Step 2 of 3 - Tell us about your farm
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Farm Size */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📏 Farm Size (Acres)
                        </label>
                        <input
                            type="number"
                            name="farmSize"
                            value={localData.farmSize}
                            onChange={handleChange}
                            placeholder="Enter farm size in acres"
                            min="0.1"
                            step="0.1"
                            className={`w-full p-4 border rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                errors.farmSize ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.farmSize && (
                            <p className="text-red-500 text-sm mt-1">{errors.farmSize}</p>
                        )}
                    </div>

                    {/* Farm Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📍 Farm Location
                        </label>
                        <input
                            type="text"
                            name="farmLocation"
                            value={localData.farmLocation}
                            onChange={handleChange}
                            placeholder="Enter city, state, or region"
                            className={`w-full p-4 border rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                errors.farmLocation ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            e.g., Pune, Maharashtra or Karnataka, India
                        </p>
                        {errors.farmLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.farmLocation}</p>
                        )}
                    </div>

                    {/* Primary Crop */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🌱 Primary Crop
                        </label>
                        <select
                            name="primaryCrop"
                            value={localData.primaryCrop}
                            onChange={handleChange}
                            className={`w-full p-4 border rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                errors.primaryCrop ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                        >
                            <option value="">Select your main crop</option>
                            {crops.map((crop) => (
                                <option key={crop.value} value={crop.value}>
                                    {crop.label}
                                </option>
                            ))}
                        </select>
                        {errors.primaryCrop && (
                            <p className="text-red-500 text-sm mt-1">{errors.primaryCrop}</p>
                        )}
                    </div>

                    {/* Info Note */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 text-sm">
                            🌾 This information helps us provide personalized crop recommendations
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
                        >
                            ← Previous
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Next: Verify →
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        Step 2 of 3 - Help us understand your farming needs
                    </p>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-5 w-16 h-16 bg-emerald-200/30 rounded-full blur-lg"></div>
        </div>
    );
}

export default Step2_FarmSetup;