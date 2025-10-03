// src/components/Homepage/TestimonialsSection.jsx
import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Ramesh Kumar',
      location: 'Punjab',
      crop: 'Rice',
      photo: '👨‍🌾',
      quote: 'Increased my rice yield by 12% in just one season. The irrigation alerts saved me thousands in water costs.',
      metric: '+12% Yield Increase',
      savings: '₹25,000 saved'
    },
    {
      name: 'Sunita Devi',
      location: 'Maharashtra',
      crop: 'Cotton',
      photo: '👩‍🌾',
      quote: 'The pest alerts helped me prevent a major crop loss. Early warning saved my entire cotton harvest.',
      metric: '+8% Revenue',
      savings: 'Prevented ₹50,000 loss'
    },
    {
      name: 'Vikram Singh',
      location: 'Uttar Pradesh',
      crop: 'Wheat',
      photo: '👨‍🌾',
      quote: 'Weather predictions are so accurate! I plan my farming activities with confidence now.',
      metric: '+15% Efficiency',
      savings: '₹18,000 resource savings'
    }
  ];

  const statistics = [
    { number: '10,000+', label: 'Active Farmers' },
    { number: '15%', label: 'Average Yield Increase' },
    { number: '25%', label: 'Resource Savings' },
    { number: '98%', label: 'Prediction Accuracy' }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real Results from Real Farmers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how farmers across India are transforming their harvests with our AI platform
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">
                  {testimonial.photo}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {testimonial.location} • {testimonial.crop} Farmer
                  </p>
                </div>
              </div>
              
              <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {testimonial.metric}
                  </div>
                  <div className="text-green-600 font-semibold text-sm">
                    {testimonial.savings}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {statistics.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-green-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof CTA */}
        <div className="text-center bg-gray-50 rounded-2xl p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Join thousands of successful farmers
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Don't let another season pass without the power of AI on your side. 
            Start your journey to better yields today.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
            Start Your Success Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;