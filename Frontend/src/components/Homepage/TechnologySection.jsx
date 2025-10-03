// src/components/Homepage/TechnologySection.jsx
import React from 'react';

const TechnologySection = () => {
  const technologies = [
    {
      icon: '🤖',
      name: 'Machine Learning',
      description: 'Advanced algorithms trained on agricultural data'
    },
    {
      icon: '🌦️',
      name: 'Weather APIs',
      description: 'Real-time weather integration and forecasting'
    },
    {
      icon: '🌱',
      name: 'Soil Sensors',
      description: 'IoT-enabled soil health monitoring'
    },
    {
      icon: '🧠',
      name: 'Neural Networks',
      description: 'Deep learning for pattern recognition'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by Advanced AI Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Our platform uses machine learning trained on millions of data points 
            from farms across India to deliver accurate predictions
          </p>
        </div>

        {/* Technology Flow */}
        <div className="mb-16 overflow-x-auto">
          <div className="flex items-center justify-center space-x-8 min-w-max px-4">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                📊
              </div>
              <span className="text-gray-300 font-semibold">Historical Data</span>
            </div>
            <div className="text-green-400 text-2xl">→</div>
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                🤖
              </div>
              <span className="text-gray-300 font-semibold">AI Model</span>
            </div>
            <div className="text-green-400 text-2xl">→</div>
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                🎯
              </div>
              <span className="text-gray-300 font-semibold">Predictions</span>
            </div>
            <div className="text-green-400 text-2xl">→</div>
            <div className="text-center">
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                👨‍🌾
              </div>
              <span className="text-gray-300 font-semibold">Farmer</span>
            </div>
          </div>
        </div>

        {/* Technology Badges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {technologies.map((tech, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
              <div className="text-4xl mb-4 text-center">{tech.icon}</div>
              <h4 className="text-xl font-semibold text-white mb-3 text-center">
                {tech.name}
              </h4>
              <p className="text-gray-400 text-center leading-relaxed">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* Technology Stats */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-green-100">Data Points Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Crop Varieties Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;