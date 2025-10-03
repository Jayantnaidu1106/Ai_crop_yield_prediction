// src/components/Homepage/FinalCTASection.jsx
import React from 'react';

const FinalCTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-green-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-green-100 leading-relaxed max-w-3xl mx-auto">
            Join thousands of farmers already increasing their yields with AI-powered insights. 
            Start your free trial today and see the difference data-driven farming can make.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            className="bg-white text-green-600 hover:bg-gray-100 px-10 py-5 rounded-lg font-bold text-xl transition-colors shadow-lg hover:shadow-xl"
            onClick={() => window.location.href = '/signup'}
          >
            Get Started Free
          </button>
          <button 
            className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-10 py-5 rounded-lg font-bold text-xl transition-colors"
            onClick={() => {}}
          >
            Schedule Demo Call
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-12 text-green-100">
          <div className="flex items-center">
            <span className="text-white mr-2 font-bold">✓</span>
            <span>7-day free trial</span>
          </div>
          <div className="flex items-center">
            <span className="text-white mr-2 font-bold">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center">
            <span className="text-white mr-2 font-bold">✓</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center bg-green-700 bg-opacity-50 px-4 py-2 rounded-full">
            <span className="text-2xl mr-2">🔒</span>
            <span className="text-green-100">SSL Secured</span>
          </div>
          <div className="flex items-center bg-green-700 bg-opacity-50 px-4 py-2 rounded-full">
            <span className="text-2xl mr-2">🛡️</span>
            <span className="text-green-100">Data Protected</span>
          </div>
          <div className="flex items-center bg-green-700 bg-opacity-50 px-4 py-2 rounded-full">
            <span className="text-2xl mr-2">🏆</span>
            <span className="text-green-100">Award Winning</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">10,000+</div>
            <div className="text-green-200">Happy Farmers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">₹50Cr+</div>
            <div className="text-green-200">Additional Income Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">25%</div>
            <div className="text-green-200">Average Cost Reduction</div>
          </div>
        </div>

        <div className="bg-yellow-100 text-yellow-800 px-6 py-4 rounded-lg inline-block">
          <p className="font-semibold">
            🌱 <strong>Limited Time:</strong> Get premium features free for 30 days when you sign up this month!
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;