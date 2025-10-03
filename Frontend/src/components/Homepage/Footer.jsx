// src/components/Homepage/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Success Stories', href: '/testimonials' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'WhatsApp Support', href: 'https://wa.me/919876543210' },
      { name: 'Video Tutorials', href: '/tutorials' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Partners', href: '/partners' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Data Security', href: '/security' },
      { name: 'Cookie Policy', href: '/cookies' }
    ]
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'मराठी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/src/assets/krishi-mitra-logo.jpg" 
                alt="Krishi Mitra" 
                className="w-12 h-12 rounded-lg mr-4"
              />
              <h3 className="text-2xl font-bold text-white">Krishi Mitra</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-md">
              Empowering farmers with AI-driven insights for better yields and sustainable agriculture. 
              Join the future of farming today.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <span className="text-xl mr-3">📞</span>
                <span>1800-123-FARM (Free)</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-xl mr-3">💬</span>
                <span>WhatsApp: +91-98765-43210</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-xl mr-3">✉️</span>
                <span>support@krishimitra.in</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Secondary Footer */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Language Selector */}
            <div className="flex items-center">
              <label htmlFor="language-select" className="text-gray-300 mr-3">
                🌐 Language:
              </label>
              <select 
                id="language-select" 
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:text-green-400 transition-colors" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="text-2xl hover:text-green-400 transition-colors" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="text-2xl hover:text-green-400 transition-colors" aria-label="Instagram">
                📷
              </a>
              <a href="#" className="text-2xl hover:text-green-400 transition-colors" aria-label="YouTube">
                📺
              </a>
              <a href="#" className="text-2xl hover:text-green-400 transition-colors" aria-label="LinkedIn">
                💼
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8">
          {/* Partner Logos */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="text-gray-400">Trusted Partners:</span>
            <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">🏛️ Govt. of India</div>
            <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">🎓 IIT Research</div>
            <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">🌾 ICAR</div>
            <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">💡 Startup India</div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {footerLinks.legal.map((link, index) => (
              <a 
                key={index}
                href={link.href} 
                className="text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400">
            <p className="mb-2">
              © {currentYear} Krishi Mitra. All rights reserved. Made with ❤️ for Indian farmers.
            </p>
            <p className="text-sm">
              Predictions are based on available data and weather conditions. Actual results may vary.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;