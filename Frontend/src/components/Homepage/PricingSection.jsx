// src/components/Homepage/PricingSection.jsx
import React from 'react';

const PricingSection = () => {
  const pricingPlans = [
    {
      name: 'Free Trial',
      price: '₹0',
      period: 'for 7 days',
      description: 'Perfect to get started',
      features: [
        'Basic yield predictions',
        'Weather alerts',
        'Irrigation reminders',
        'Mobile app access',
        'Email support'
      ],
      highlight: false,
      cta: 'Start Free Trial',
      note: 'No credit card required'
    },
    {
      name: 'Basic Plan',
      price: '₹199',
      period: 'per month',
      description: 'For small farms (up to 5 acres)',
      features: [
        'Everything in Free Trial',
        'Advanced crop analytics',
        'Pest & disease alerts',
        'Fertilization scheduler',
        'WhatsApp notifications',
        'Phone support'
      ],
      highlight: true,
      cta: 'Choose Basic',
      note: 'Most popular for small farmers'
    },
    {
      name: 'Pro Plan',
      price: '₹499',
      period: 'per month',
      description: 'For larger farms with advanced needs',
      features: [
        'Everything in Basic Plan',
        'Multi-crop management',
        'Soil health monitoring',
        'Market price insights',
        'Custom recommendations',
        'Priority support',
        'Farm management tools'
      ],
      highlight: false,
      cta: 'Choose Pro',
      note: 'Best for commercial farming'
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Affordable pricing designed for farmers at every scale. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div key={index} 
                 className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                   plan.highlight 
                     ? 'border-2 border-green-500 transform scale-105' 
                     : 'border border-gray-200'
                 }`}>
              
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 mr-3 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <button 
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    plan.highlight
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                  onClick={() => window.location.href = '/signup'}
                >
                  {plan.cta}
                </button>
                <p className="text-sm text-gray-600 mt-3">{plan.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
            <p className="text-gray-600 text-sm">Your farm data is encrypted and never shared</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <h4 className="font-semibold text-gray-900 mb-2">Mobile First</h4>
            <p className="text-gray-600 text-sm">Works perfectly on your smartphone</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h4 className="font-semibold text-gray-900 mb-2">Offline Capable</h4>
            <p className="text-gray-600 text-sm">Basic features work without internet</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="font-semibold text-gray-900 mb-2">Local Language</h4>
            <p className="text-gray-600 text-sm">Available in Hindi and regional languages</p>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🛡️ 30-Day Money Back Guarantee
          </h3>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Not satisfied with the results? Get a full refund within 30 days. 
            We're confident our platform will improve your farming outcomes and increase your yields.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;