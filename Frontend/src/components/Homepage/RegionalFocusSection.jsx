// src/components/Homepage/RegionalFocusSection.jsx
import React, { useState } from 'react';

const RegionalFocusSection = () => {
  const [selectedRegion, setSelectedRegion] = useState('punjab');

  const regions = {
    punjab: {
      name: 'Punjab',
      crops: ['Rice', 'Wheat', 'Maize'],
      specialization: 'Rice and Wheat Belt',
      farmers: '2,500+',
      avgIncrease: '14%'
    },
    maharashtra: {
      name: 'Maharashtra',
      crops: ['Cotton', 'Sugarcane', 'Soybean'],
      specialization: 'Cotton Growing Region',
      farmers: '3,200+',
      avgIncrease: '16%'
    },
    up: {
      name: 'Uttar Pradesh',
      crops: ['Wheat', 'Rice', 'Pulses'],
      specialization: 'Diverse Crop Production',
      farmers: '4,100+',
      avgIncrease: '12%'
    },
    karnataka: {
      name: 'Karnataka',
      crops: ['Coffee', 'Rice', 'Ragi'],
      specialization: 'Southern Crop Diversity',
      farmers: '1,800+',
      avgIncrease: '15%'
    }
  };

  const majorCrops = [
    { name: 'Rice', icon: '🌾', regions: 'Punjab, WB, AP' },
    { name: 'Wheat', icon: '🌾', regions: 'Punjab, UP, MP' },
    { name: 'Cotton', icon: '🌿', regions: 'Maharashtra, Gujarat' },
    { name: 'Sugarcane', icon: '🎋', regions: 'UP, Maharashtra' },
    { name: 'Maize', icon: '🌽', regions: 'Karnataka, AP' },
    { name: 'Pulses', icon: '🫛', regions: 'MP, Maharashtra' }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Indian Farmers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tailored insights for different regions and crops across India
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Your Region</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {Object.entries(regions).map(([key, region]) => (
                <button
                  key={key}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    selectedRegion === key
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300 hover:bg-green-50'
                  }`}
                  onClick={() => setSelectedRegion(key)}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {regions[selectedRegion].name} Farming
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-semibold text-gray-900">
                    {regions[selectedRegion].specialization}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Farmers:</span>
                  <span className="font-semibold text-blue-600">
                    {regions[selectedRegion].farmers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Yield Increase:</span>
                  <span className="font-semibold text-green-600">
                    {regions[selectedRegion].avgIncrease}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Supported Crops:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {regions[selectedRegion].crops.map((crop, index) => (
                    <span 
                      key={index} 
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Major Crops Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Major Crops We Support
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {majorCrops.map((crop, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="text-4xl mb-3">{crop.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{crop.name}</h4>
                <p className="text-sm text-gray-600">Popular in: {crop.regions}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regional CTA */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to optimize your regional farming?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get region-specific insights tailored to your local climate, soil conditions, and crop varieties.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
            Find Your Region's Insights
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegionalFocusSection;