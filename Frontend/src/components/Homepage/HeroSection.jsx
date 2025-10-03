// src/components/Homepage/HeroSection.jsx
import React, { useState } from 'react';

const HeroSection = () => {
  const [selectedCrop, setSelectedCrop] = useState('');

  const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses'];

  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-100 py-20 px-4 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Increase Your Crop Yields by 10%+ with 
              <span className="text-green-600"> AI-Powered Farming Insights</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Predict yields, optimize resources, and get personalized recommendations 
              using advanced AI technology. Make data-driven farming decisions that 
              boost your harvest and reduce costs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Start Free Analysis
              </button>
              <button 
                onClick={() => {}}
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Watch How It Works
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700 mb-2">
                See predictions for your crop:
              </label>
              <select 
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select your crop</option>
                {crops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">10,000+</div>
                <div className="text-sm text-gray-600">Trusted Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15%</div>
                <div className="text-sm text-gray-600">Avg. Yield Increase</div>
              </div>
              <div className="flex gap-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  🇮🇳 Hindi
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  🌾 Regional Languages
                </span>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Your Farm Dashboard</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="text-sm text-gray-600">Predicted Yield</div>
                  <div className="text-2xl font-bold text-green-700">45.2 Quintals/Acre</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span className="mr-1">↗</span> +12% vs last year
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="text-sm text-gray-600">Next Action</div>
                  <div className="text-xl font-semibold text-blue-700">Irrigation</div>
                  <div className="text-sm text-blue-600">Due in 2 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;