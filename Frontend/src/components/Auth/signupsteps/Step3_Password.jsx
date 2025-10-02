// src/components/Auth/SignUpSteps/Step3_FarmSetup.jsx (New Name)

import React, { useState } from 'react';

function Step3_FarmSetup({ formData, updateFormData, submitFinalForm, prevStep }) {
    const [localData, setLocalData] = useState(formData);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Update form data before final submission
        updateFormData(localData);

        // Final Submission: All data is collected
        await submitFinalForm(localData);

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">Step 3 of 3: Farm Details</h2>
                <p className="text-sm text-white/90 mt-1 [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">Final step: Tailor the AI insights to your field.</p>
            </div>

            {/* Farm Size Input */}
            <input
                name="farmSize"
                type="number"
                placeholder="Farm Size (Acres)"
                value={localData.farmSize || ''}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                required
            />

            {/* Map/Location Placeholder */}
            <div className="relative w-full h-40 bg-white/20 border border-white/30 rounded-xl overflow-hidden shadow-md backdrop-blur-sm">
                <div className="flex items-center justify-center h-full text-white/70 text-sm [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)]">
                    [Click to Pin Farm Location]
                </div>
                <span className="absolute top-3 right-3 p-2 bg-white/70 rounded-full shadow-md cursor-pointer">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
            </div>

            {/* Primary Crop Selection */}
            <div className="relative">
                <label className="text-sm font-medium text-white/90 mb-1 block [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">Primary Crop:</label>
                <select
                    name="primaryCrop"
                    onChange={handleChange}
                    value={localData.primaryCrop || ''}
                    className="w-full px-5 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm appearance-none"
                    required
                >
                    <option value="" disabled>Select Primary Crop</option>
                    <option value="rice">Rice (धान)</option>
                    <option value="cotton">Cotton (कपास)</option>
                    <option value="sugarcane">Sugarcane (गन्ना)</option>
                    <option value="maize">Maize (मक्का)</option>
                </select>
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            <div className="flex justify-between space-x-4 pt-4">
                <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 text-white font-bold rounded-xl border-2 border-white/50 bg-white/10 hover:bg-white/20 transition duration-150 shadow-md [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]"
                >
                    ← Back
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-green-700 text-white font-extrabold rounded-xl shadow-lg hover:bg-green-800 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Completing...</span>
                        </div>
                    ) : 'Finish Setup'}
                </button>
            </div>
        </form>
    );
}

export default Step3_FarmSetup;