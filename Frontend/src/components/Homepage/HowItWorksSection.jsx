// src/components/Homepage/HowItWorksSection.jsx
import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: '📍',
      title: 'Enter Your Farm Details',
      description: 'Location, crop type, farm size',
      details: 'Simply provide basic information about your farm and we\'ll customize everything for you'
    },
    {
      number: '02',
      icon: '🧠',
      title: 'AI Analyzes Your Data',
      description: 'Our system processes weather, soil, and historical data',
      details: 'Advanced machine learning algorithms work 24/7 to analyze millions of data points'
    },
    {
      number: '03',
      icon: '📱',
      title: 'Get Personalized Recommendations',
      description: 'Receive daily insights and alerts on your phone',
      details: 'Actionable advice delivered when you need it, in your preferred language'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From setup to harvest optimization in minutes
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300 relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl mb-6 text-center">
                    {step.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-green-600 font-medium mb-4 text-center">
                    {step.description}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed text-center">
                    {step.details}
                  </p>
                </div>

                {/* Arrow Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                      →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Background connecting line */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-green-200 via-green-300 to-green-200 transform -translate-y-1/2 z-0"></div>
        </div>

        {/* Demo CTA */}
        <div className="text-center mt-16">
          <button className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-lg font-semibold text-xl transition-colors shadow-lg hover:shadow-xl mb-4">
            Try Live Demo
          </button>
          <p className="text-gray-600">
            No registration required • See instant results
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;