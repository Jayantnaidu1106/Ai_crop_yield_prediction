// src/pages/Dashboard.jsx - Agricultural AI Platform Homepage

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Import all homepage components
import HeroSection from '../components/Homepage/HeroSection';
import ProblemSolutionSection from '../components/Homepage/ProblemSolutionSection';
import FeaturesSection from '../components/Homepage/FeaturesSection';
import HowItWorksSection from '../components/Homepage/HowItWorksSection';
import TestimonialsSection from '../components/Homepage/TestimonialsSection';
import TechnologySection from '../components/Homepage/TechnologySection';
import RegionalFocusSection from '../components/Homepage/RegionalFocusSection';
import PricingSection from '../components/Homepage/PricingSection';
import FAQSection from '../components/Homepage/FAQSection';
import FinalCTASection from '../components/Homepage/FinalCTASection';
import Footer from '../components/Homepage/Footer';

// Import weather components
import DualWeatherWidget from '../components/Weather/DualWeatherWidget';

function Dashboard() {
    const { logout, user } = useAuth();
    const [showDashboard, setShowDashboard] = useState(false);

    // Check if user wants to see the actual dashboard vs homepage
    useEffect(() => {
        // If user has completed onboarding, show dashboard
        // Otherwise show homepage for new users
        const hasCompletedOnboarding = user?.onboardingComplete || false;
        setShowDashboard(hasCompletedOnboarding);
    }, [user]);

    // Sticky CTA button state
    const [showStickyCTA, setShowStickyCTA] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setShowStickyCTA(scrollPosition > 800);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // If user wants dashboard, show the original dashboard
    if (showDashboard) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.name || 'Farmer'}! 🌾
                            </h1>
                            <div className="space-x-4">
                                <button 
                                    onClick={() => setShowDashboard(false)} 
                                    className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    View Homepage
                                </button>
                                <button 
                                    onClick={logout} 
                                    className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors border border-gray-300 hover:border-gray-400"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Farm Status</h3>
                            <p className="text-green-600 font-medium">Everything looks good! 🌱</p>
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full w-4/5"></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Action</h3>
                            <p className="text-blue-600 font-medium">Check irrigation in 2 days</p>
                            <div className="mt-4 flex items-center text-sm text-gray-600">
                                <span className="mr-2">📅</span>
                                October 4, 2025
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Predicted Yield</h3>
                            <p className="text-green-600 font-medium">Expected: 45.2 Quintals/Acre</p>
                            <div className="mt-4 flex items-center text-sm text-green-600">
                                <span className="mr-2">↗</span>
                                +12% vs last season
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                            onClick={() => alert('Feature coming soon!')}
                        >
                            View Detailed Analytics
                        </button>
                        <button 
                            className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                            onClick={() => alert('Feature coming soon!')}
                        >
                            Update Farm Details
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    // Show comprehensive homepage for new users
    return (
        <div className="homepage-container">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img src="/src/assets/krishi-mitra-logo.jpg" alt="Krishi Mitra" className="w-10 h-10 rounded-lg mr-3" />
                            <span className="text-xl font-bold text-gray-900">Krishi Mitra</span>
                        </div>
                        
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-700 hover:text-green-600 font-medium transition-colors">How It Works</a>
                            <a href="#pricing" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Pricing</a>
                            <a href="#testimonials" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Success Stories</a>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <button 
                                        onClick={() => setShowDashboard(true)} 
                                        className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        My Dashboard
                                    </button>
                                    <button 
                                        onClick={logout} 
                                        className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a href="/login" className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">Login</a>
                                    <a href="/signup" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Get Started</a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sticky CTA Button */}
            {showStickyCTA && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button 
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        onClick={() => window.location.href = '/signup'}
                    >
                        Start Free Trial
                    </button>
                </div>
            )}

            {/* Homepage Sections */}
            <main className="pt-16">
                <HeroSection />
                <ProblemSolutionSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TestimonialsSection />
                <TechnologySection />
                <RegionalFocusSection />
                <PricingSection />
                <FAQSection />
                <FinalCTASection />
            </main>

            <Footer />

            {/* Interactive Elements */}
            <div className="fixed bottom-6 left-6 z-40">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center"
                    onClick={() => alert('Chat feature coming soon!')}
                >
                    <span className="mr-2">💬</span>
                    Ask Expert
                </button>
            </div>

            {/* Weather Widget */}
            <div className="fixed top-20 right-6 z-40">
                            {/* Dual Weather Widget - Fixed Position */}
            <DualWeatherWidget 
                className="fixed top-20 right-6 z-40 w-72"
            />
            </div>
        </div>
    );
}

export default Dashboard;