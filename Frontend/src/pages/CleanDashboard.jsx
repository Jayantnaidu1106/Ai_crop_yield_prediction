// src/pages/CleanDashboard.jsx - Simplified Dashboard with Weather

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DualWeatherWidget from '../components/Weather/DualWeatherWidget';
import WeatherTest from '../components/Weather/WeatherTest';
import LanguageSelector from '../components/UI/LanguageSelector';

function CleanDashboard() {
    const { t } = useTranslation();
    const { logout, farmLocation } = useAuth();
    const navigate = useNavigate();

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
                                    <p className="text-sm text-gray-600">{t('dashboard.welcome')}</p>
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

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Yield Prediction</h3>
                                <p className="text-purple-600 font-medium">45.2 Quintals/Acre</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-purple-600">
                            <span className="mr-1">↗</span>
                            +12% vs last season
                        </div>
                    </div>
                </div>

                {/* Weather and Analytics Section */}
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Weather Widget - Takes up 1 column */}
                    <div className="lg:col-span-1">
                        <DualWeatherWidget className="h-fit" />
                    </div>
                    
                    {/* Weather Test Component - Takes up 1 column */}
                    <div className="lg:col-span-1">
                        <WeatherTest />
                    </div>

                    {/* Farming Tips Section - Takes up 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">💡</span>
                                Smart Farming Tips
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                                    <h4 className="font-semibold text-green-800 mb-2">🌱 Optimal Planting Time</h4>
                                    <p className="text-green-700 text-sm">
                                        Based on weather patterns, the best time for sowing is in the next 7-10 days. 
                                        Soil moisture levels are ideal.
                                    </p>
                                </div>
                                
                                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-semibold text-blue-800 mb-2">💧 Irrigation Schedule</h4>
                                    <p className="text-blue-700 text-sm">
                                        Next irrigation recommended in 2-3 days. Monitor soil moisture and weather forecasts 
                                        for optimal timing.
                                    </p>
                                </div>
                                
                                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                                    <h4 className="font-semibold text-orange-800 mb-2">🐛 Pest Management</h4>
                                    <p className="text-orange-700 text-sm">
                                        Current weather conditions favor pest activity. Consider preventive measures 
                                        and regular field monitoring.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="mt-8">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-xl font-bold mb-3 flex items-center">
                            <span className="mr-2">🚀</span>
                            Coming Soon
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <span>📊</span>
                                <span>Advanced Analytics Dashboard</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>🛰️</span>
                                <span>Satellite Crop Monitoring</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>🤖</span>
                                <span>AI-Powered Crop Recommendations</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CleanDashboard;