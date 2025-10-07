// src/context/LanguageContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const LanguageContext = createContext();

// Available languages matching backend User model
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' }
];

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language from localStorage or browser detection
  useEffect(() => {
    const savedLanguage = localStorage.getItem('krishimitra-language');
    if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      // Auto-detect from browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
      if (supportedLang) {
        setCurrentLanguage(supportedLang.code);
        i18n.changeLanguage(supportedLang.code);
      }
    }
  }, [i18n]);

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (!SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      console.error('Unsupported language code:', languageCode);
      return;
    }

    setIsLoading(true);
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      localStorage.setItem('krishimitra-language', languageCode);
      
      // Update document language attribute
      document.documentElement.lang = languageCode;
      
      // Update direction for RTL languages if needed (currently all supported are LTR)
      document.documentElement.dir = 'ltr';
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current language details
  const getCurrentLanguageDetails = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  // Check if language is supported
  const isLanguageSupported = (languageCode) => {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
  };

  const value = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    getCurrentLanguageDetails,
    isLanguageSupported,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;