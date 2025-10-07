// src/components/UI/LanguageSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, Globe, Check } from 'lucide-react';
import PropTypes from 'prop-types';

const LanguageSelector = ({ 
  variant = 'default', 
  showLabel = true,
  className = '',
  dropdownAlign = 'right'
}) => {
  const { t } = useTranslation();
  const { 
    currentLanguage, 
    supportedLanguages, 
    changeLanguage, 
    getCurrentLanguageDetails,
    isLoading 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode) => {
    setIsOpen(false);
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          button: 'px-2 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50',
          dropdown: 'w-40'
        };
      case 'splash':
        return {
          button: 'px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
          dropdown: 'w-56'
        };
      case 'menu':
        return {
          button: 'w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center justify-between',
          dropdown: 'w-full'
        };
      default:
        return {
          button: 'px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50',
          dropdown: 'w-52'
        };
    }
  };

  const styles = getVariantStyles();
  const currentLangDetails = getCurrentLanguageDetails();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          ${styles.button}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2
        `}
        aria-label={t('settings.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        {showLabel && (
          <span className="truncate">
            {variant === 'splash' 
              ? t('splash.selectLanguage')
              : currentLangDetails.nativeName
            }
          </span>
        )}
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute z-50 mt-1 ${styles.dropdown} bg-white border border-gray-200 
          rounded-md shadow-lg max-h-60 overflow-auto
          ${dropdownAlign === 'left' ? 'left-0' : 'right-0'}
        `}>
          <div className="py-1" role="listbox">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-blue-50
                  flex items-center justify-between
                  ${currentLanguage === language.code 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700'
                  }
                `}
                role="option"
                aria-selected={currentLanguage === language.code}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

LanguageSelector.propTypes = {
  variant: PropTypes.oneOf(['default', 'compact', 'splash', 'menu']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
  dropdownAlign: PropTypes.oneOf(['left', 'right'])
};

export default LanguageSelector;