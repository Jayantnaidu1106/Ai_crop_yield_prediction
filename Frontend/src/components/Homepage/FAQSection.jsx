// src/components/Homepage/FAQSection.jsx
import React, { useState } from 'react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqs = [
    {
      question: 'Do I need internet access all the time?',
      answer: 'No! Basic features like viewing your last recommendations and yield predictions work offline. You only need internet to sync new data and get fresh recommendations.'
    },
    {
      question: 'Which crops does the platform support?',
      answer: 'We support 50+ crops including Rice, Wheat, Cotton, Sugarcane, Maize, Pulses, Vegetables, and regional specialties. New crops are added based on farmer requests.'
    },
    {
      question: 'How accurate are the predictions?',
      answer: 'Our AI model achieves 95%+ accuracy for weather predictions and 90%+ for yield forecasts. Accuracy improves as we learn more about your specific farm conditions.'
    },
    {
      question: 'Do I need special equipment?',
      answer: 'Not at all! Just a smartphone is enough. However, optional soil sensors and weather stations can provide even more accurate recommendations.'
    },
    {
      question: 'Is my farm data private and secure?',
      answer: 'Absolutely. Your data is encrypted, stored securely, and never shared without permission. You maintain full ownership of your agricultural data.'
    },
    {
      question: 'What languages are available?',
      answer: 'Available in Hindi, English, and 8 regional languages including Punjabi, Marathi, Telugu, Tamil, Bengali, and more. Language support is expanding.'
    },
    {
      question: 'How much does it cost?',
      answer: 'Start with a free 7-day trial. Then choose from ₹199/month for small farms or ₹499/month for larger operations. Special discounts available for farmer cooperatives.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? -1 : index);
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about our AI farming platform
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                  <button 
                    className="w-full text-left p-6 focus:outline-none focus:bg-gray-100 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <span className={`text-2xl font-bold text-green-600 transform transition-transform ${
                        openFAQ === index ? 'rotate-45' : ''
                      }`}>
                        +
                      </span>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === index ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}>
                    <div className="px-6">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Still Have Questions?
              </h3>
              <p className="text-gray-700 mb-8">
                Our farming experts are here to help you succeed
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📞</span>
                  <div>
                    <div className="font-semibold text-gray-900">Call Us</div>
                    <div className="text-green-600">1800-123-FARM</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">💬</span>
                  <div>
                    <div className="font-semibold text-gray-900">WhatsApp</div>
                    <div className="text-green-600">+91-98765-43210</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">✉️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-green-600">support@krishimitra.in</div>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                Chat with Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;