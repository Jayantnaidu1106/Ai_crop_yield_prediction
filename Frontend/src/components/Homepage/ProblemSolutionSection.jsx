// src/components/Homepage/ProblemSolutionSection.jsx
import React from 'react';

const ProblemSolutionSection = () => {
  const problems = [
    {
      icon: '🌦️',
      title: 'Unpredictable Weather',
      description: 'Sudden weather changes cause crop failures and financial losses'
    },
    {
      icon: '💧',
      title: 'Wasted Resources',
      description: 'Overuse of water, fertilizers, and pesticides increases costs'
    },
    {
      icon: '🤷‍♂️',
      title: 'Limited Expertise',
      description: 'Lack of access to agricultural experts and timely advice'
    }
  ];

  const solutions = [
    {
      icon: '🎯',
      title: 'Accurate Predictions',
      description: 'AI-powered weather analysis provides reliable yield forecasts'
    },
    {
      icon: '⚡',
      title: 'Optimized Usage',
      description: 'Smart scheduling reduces resource waste by up to 30%'
    },
    {
      icon: '💬',
      title: '24/7 Expert Advice',
      description: 'Get personalized recommendations in your local language'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Problems Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            The Challenges Farmers Face Today
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Every day, farmers across India struggle with these critical challenges
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transition */}
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-green-600 mb-4">
            Our AI Platform Solves These Problems
          </h2>
          <div className="text-6xl animate-bounce">⬇️</div>
        </div>

        {/* Solutions Section */}
        <div>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 text-center hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-4">{solution.icon}</div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">{solution.title}</h3>
                <p className="text-green-700 leading-relaxed">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
            See How It Works
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;