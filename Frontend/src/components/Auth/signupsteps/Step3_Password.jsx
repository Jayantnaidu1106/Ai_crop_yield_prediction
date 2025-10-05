// src/components/Auth/SignUpSteps/Step3_FarmSetup.jsx (New Name)

import React, { useState } from 'react';

function Step3_FarmSetup({ formData, updateFormData, submitFinalForm, prevStep }) {
    const [localData, setLocalData] = useState(formData);
    const [isLoading, setIsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const handleChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    // Auto-detect current location for farm location
    const detectCurrentLocation = () => {
        setLocationLoading(true);
        
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Reverse geocoding to get address from coordinates
                    const response = await fetch(
                        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=7ddc55e1f217ce54924dcf61d7c42580`
                    );
                    const data = await response.json();
                    
                    if (data.length > 0) {
                        const location = data[0];
                        // Structure according to backend schema
                        setLocalData(prev => ({
                            ...prev,
                            farmLocation: {
                                latitude: latitude,
                                longitude: longitude,
                                state: location.state || '',
                                district: location.name || '', // Use name as district if available
                                village: '',
                                pincode: '',
                                address: `${location.name}, ${location.state}, ${location.country}`
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Error getting location details:', error);
                    // Still save coordinates even if reverse geocoding fails
                    setLocalData(prev => ({
                        ...prev,
                        farmLocation: {
                            latitude: latitude,
                            longitude: longitude,
                            state: '',
                            district: '',
                            village: '',
                            pincode: '',
                            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        }
                    }));
                }
                setLocationLoading(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your current location. Please enter manually.');
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Ensure farm location is properly formatted
        const finalData = {
            ...localData,
            farmLocation: localData.farmLocation || {
                city: localData.farmCity || '',
                state: localData.farmState || '',
                country: 'India'
            }
        };

        // Update form data before final submission
        updateFormData(finalData);

        // Final Submission: All data is collected
        await submitFinalForm(finalData);

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

            {/* Farm Location Input */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-white/90 mb-1 block [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                    Farm Location:
                </label>
                
                {/* Current Location Button */}
                <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={locationLoading}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-150 shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {locationLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Getting Location...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>Use Current Location</span>
                        </>
                    )}
                </button>

                {/* Manual Location Input - Updated to match backend schema */}
                <div className="grid grid-cols-2 gap-4">
                    <input
                        name="state"
                        type="text"
                        placeholder="State *"
                        value={localData.farmLocation?.state || localData.state || ''}
                        onChange={(e) => {
                            handleChange(e);
                            setLocalData(prev => ({
                                ...prev,
                                farmLocation: {
                                    ...prev.farmLocation,
                                    state: e.target.value
                                }
                            }));
                        }}
                        className="px-4 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                        required
                    />
                    <input
                        name="district"
                        type="text"
                        placeholder="District *"
                        value={localData.farmLocation?.district || localData.district || ''}
                        onChange={(e) => {
                            handleChange(e);
                            setLocalData(prev => ({
                                ...prev,
                                farmLocation: {
                                    ...prev.farmLocation,
                                    district: e.target.value
                                }
                            }));
                        }}
                        className="px-4 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <input
                        name="village"
                        type="text"
                        placeholder="Village (Optional)"
                        value={localData.farmLocation?.village || localData.village || ''}
                        onChange={(e) => {
                            handleChange(e);
                            setLocalData(prev => ({
                                ...prev,
                                farmLocation: {
                                    ...prev.farmLocation,
                                    village: e.target.value
                                }
                            }));
                        }}
                        className="px-4 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                    />
                    <input
                        name="pincode"
                        type="text"
                        placeholder="Pincode (Optional)"
                        maxLength="6"
                        value={localData.farmLocation?.pincode || localData.pincode || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                            handleChange(e);
                            setLocalData(prev => ({
                                ...prev,
                                farmLocation: {
                                    ...prev.farmLocation,
                                    pincode: value
                                }
                            }));
                        }}
                        className="px-4 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                    />
                </div>

                {/* Additional Address Field */}
                <input
                    name="address"
                    type="text"
                    placeholder="Full Address (Optional)"
                    value={localData.farmLocation?.address || localData.address || ''}
                    onChange={(e) => {
                        handleChange(e);
                        setLocalData(prev => ({
                            ...prev,
                            farmLocation: {
                                ...prev.farmLocation,
                                address: e.target.value
                            }
                        }));
                    }}
                    className="px-4 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
                />

                {/* Display detected location */}
                {localData.farmLocation?.address && (
                    <div className="p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-white/90 text-sm">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Farm Location: {localData.farmLocation.address}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Recovery Email (Optional) */}
            <input
                name="recoveryEmail"
                type="email"
                placeholder="Recovery Email (Optional)"
                value={localData.recoveryEmail || ''}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
            />

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
                    <option value="wheat">Wheat (गेहूं)</option>
                    <option value="cotton">Cotton (कपास)</option>
                    <option value="sugarcane">Sugarcane (गन्ना)</option>
                    <option value="maize">Maize (मक्का)</option>
                    <option value="jowar">Jowar (ज्वार)</option>
                    <option value="bajra">Bajra (बाजरा)</option>
                    <option value="arhar">Arhar (अरहर)</option>
                    <option value="groundnut">Groundnut (मूंगफली)</option>
                    <option value="soybean">Soybean (सोयाबीन)</option>
                    <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Farming Experience */}
            <input
                name="farmingExperience"
                type="number"
                placeholder="Farming Experience (Years, Optional)"
                min="0"
                max="100"
                value={localData.farmingExperience || ''}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-white/50 rounded-xl bg-white/80 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition duration-150 shadow-sm"
            />

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