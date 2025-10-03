// src/components/Homepage/FeaturesSection.jsx
import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: '📊',
      title: 'Crop Yield Prediction',
      description: 'Know your expected harvest 3-6 months ahead',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    {
      icon: '💧',
      title: 'Smart Irrigation',
      description: 'Save up to 30% water with AI-timed irrigation alerts',
      bgColor: 'from-cyan-50 to-cyan-100',
      iconBg: 'bg-cyan-500',
      textColor: 'text-cyan-700'
    },
    {
      icon: '🌱',
      title: 'Fertilization Optimizer',
      description: 'Apply the right nutrients at the right time',
      bgColor: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      textColor: 'text-green-700'
    },
    {
      icon: '🐛',
      title: 'Pest & Disease Alerts',
      description: 'Early warnings based on weather and crop health',
      bgColor: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      textColor: 'text-orange-700'
    },
    {
      icon: '🌤️',
      title: 'Weather Integration',
      description: 'Real-time weather forecasts tailored to your farm',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-700'
    },
    {
      icon: '🗣️',
      title: 'Regional Language Support',
      description: 'Available in multiple languages for easy access',
      bgColor: 'from-pink-50 to-pink-100',
      iconBg: 'bg-pink-500',
      textColor: 'text-pink-700'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Our Platform Helps You Grow More
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful AI tools designed specifically for Indian farmers to maximize yields and minimize costs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} 
                 className={`bg-gradient-to-br ${feature.bgColor} p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
              <div className={`${feature.iconBg} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-semibold ${feature.textColor} mb-4`}>
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {feature.description}
              </p>
              
              {/* Visual representation */}
              <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-center h-20">
                  {index === 0 && (
                    <div className="flex space-x-1">
                      <div className="w-2 bg-green-500 h-12 rounded"></div>
                      <div className="w-2 bg-green-400 h-8 rounded"></div>
                      <div className="w-2 bg-green-600 h-16 rounded"></div>
                      <div className="w-2 bg-green-300 h-10 rounded"></div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">💧</div>
                      <div className="text-lg">📅</div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    </div>
                  )}
                  {index === 3 && (
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">⚠️</div>
                      <div className="text-2xl">🐛</div>
                    </div>
                  )}
                  {index === 4 && (
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">☁️</div>
                      <div className="text-2xl">☀️</div>
                    </div>
                  )}
                  {index === 5 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">हिंदी</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">EN</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;