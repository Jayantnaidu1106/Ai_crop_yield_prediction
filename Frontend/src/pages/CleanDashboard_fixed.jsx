// src/pages/CleanDashboard.jsx - Simplified Dashboard with Weather

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/authcontext';
import { useNavigate } from 'react-router-dom';
import DualWeatherWidget from '../components/Weather/DualWeatherWidget';
import WeatherTest from '../components/Weather/WeatherTest';
import LanguageSelector from '../components/UI/LanguageSelector';

function CleanDashboard() {
    const { t } = useTranslation();
    const { logout, farmLocation, userProfile, authToken } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Fetch user profile if not available in context
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userProfile && authToken) {
                setLoadingProfile(true);
                try {
                    const response = await fetch('http://localhost:3000/api/users/profile', {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setProfileData(data.data.user);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                } finally {
                    setLoadingProfile(false);
                }
            } else {
                setProfileData(userProfile);
            }
        };

        fetchUserProfile();
    }, [userProfile, authToken]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header with Logout */}
            <header className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">🌾</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">KrishiMitra AI</h1>
                                    <p className="text-sm text-gray-600">
                                        {profileData ? 
                                            `Welcome, ${profileData.fullName}` : 
                                            loadingProfile ? 'Loading...' : t('dashboard.welcome')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                {farmLocation && (
                                    <span className="flex items-center">
                                        <span className="mr-1">🏠</span>
                                        {t('farm.location')}: {farmLocation.city}, {farmLocation.state}
                                    </span>
                                )}
                            </div>
                            
                            {/* Language Selector */}
                            <LanguageSelector 
                                variant="compact" 
                                showLabel={false}
                                className="hidden sm:block"
                            />
                            
                            {/* AI Predictions Link */}
                            <button 
                                onClick={() => navigate('/predictions')}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                                <span>🤖 AI Predictions</span>
                            </button>

                            {/* Settings Link */}
                            <button 
                                onClick={() => navigate('/settings')}
                                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>{t('nav.settings')}</span>
                            </button>
                            
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                <span>{t('nav.logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {t('splash.welcomeTitle')} 🌾
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    {t('splash.aboutApp')}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🚜</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                {profileData && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">👤</span>
                                    Your Profile
                                </h3>
                                <button 
                                    onClick={() => navigate('/settings')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Edit Profile →
                                </button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Personal Info</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-600">Full Name</span>
                                            <p className="font-medium text-lg">{profileData.fullName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Phone Number</span>
                                            <p className="font-medium">{profileData.phone}</p>
                                        </div>
                                        {profileData.recoveryEmail && (
                                            <div>
                                                <span className="text-sm text-gray-600">Email</span>
                                                <p className="font-medium">{profileData.recoveryEmail}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Farm Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Farm Details</h4>
                                    <div className="space-y-3">
                                        {profileData.farmSize && (
                                            <div>
                                                <span className="text-sm text-gray-600">Farm Size</span>
                                                <p className="font-medium text-lg flex items-center">
                                                    <span className="mr-2">🌾</span>
                                                    {profileData.farmSize} hectares
                                                </p>
                                            </div>
                                        )}
                                        {profileData.primaryCrop && (
                                            <div>
                                                <span className="text-sm text-gray-600">Primary Crop</span>
                                                <p className="font-medium capitalize">
                                                    {profileData.primaryCrop}
                                                </p>
                                            </div>
                                        )}
                                        {profileData.farmingExperience && (
                                            <div>
                                                <span className="text-sm text-gray-600">Experience</span>
                                                <p className="font-medium">
                                                    {profileData.farmingExperience} years
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Location</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-600">Address</span>
                                            <div className="space-y-1">
                                                {profileData.location.village && (
                                                    <p className="font-medium">{profileData.location.village}</p>
                                                )}
                                                <p className="font-medium">
                                                    {profileData.location.district}, {profileData.location.state}
                                                </p>
                                                {profileData.location.pincode && (
                                                    <p className="text-sm text-gray-600">
                                                        PIN: {profileData.location.pincode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Coordinates</span>
                                            <p className="text-sm font-mono">
                                                {profileData.location.latitude?.toFixed(4)}, {profileData.location.longitude?.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Completion Status */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Profile Completion</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        profileData.profileCompleted 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {profileData.profileCompleted ? '✅ Complete' : '⚠️ Incomplete'}
                                    </span>
                                </div>
                                {!profileData.profileCompleted && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Complete your profile to get better AI recommendations
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state for profile */}
                {loadingProfile && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <span className="text-gray-600">Loading your profile...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Farm Status</h3>
                                <p className="text-green-600 font-medium">All systems operational</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full w-4/5 transition-all duration-500"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
                                <p className="text-blue-600 font-medium">Processing data...</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🤖</span>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            Next analysis: 2 hours
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/predictions')}
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer hover:bg-purple-50"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">🤖 AI Yield Prediction</h3>
                                <p className="text-purple-600 font-medium">Get AI-powered predictions</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-purple-600">
                            <span className="mr-1">→</span>
                            <span>Click to create prediction</span>
                        </div>
                    </div>
                </div>

                {/* Weather Widgets Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Dual Weather Widget */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">🌤️</span>
                                Weather Overview
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">Current and forecast conditions</p>
                        </div>
                        <div className="p-6">
                            <DualWeatherWidget />
                        </div>
                    </div>

                    {/* Weather Test Widget */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">📊</span>
                                Weather Analytics
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">Detailed weather insights</p>
                        </div>
                        <div className="p-6">
                            <WeatherTest />
                        </div>
                    </div>
                </div>

                {/* Additional Features Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-3">🚀</span>
                        Quick Actions
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button 
                            onClick={() => navigate('/predictions')}
                            className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group"
                        >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤖</div>
                            <h4 className="font-semibold text-gray-900">AI Predictions</h4>
                            <p className="text-sm text-gray-600 mt-1">Get yield forecasts</p>
                        </button>

                        <button 
                            onClick={() => navigate('/settings')}
                            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group"
                        >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                            <h4 className="font-semibold text-gray-900">Settings</h4>
                            <p className="text-sm text-gray-600 mt-1">Manage preferences</p>
                        </button>

                        <button className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all group">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</div>
                            <h4 className="font-semibold text-gray-900">Analytics</h4>
                            <p className="text-sm text-gray-600 mt-1">View insights</p>
                        </button>

                        <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💬</div>
                            <h4 className="font-semibold text-gray-900">Support</h4>
                            <p className="text-sm text-gray-600 mt-1">Get help</p>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CleanDashboard;