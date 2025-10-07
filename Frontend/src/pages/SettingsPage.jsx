// src/pages/SettingsPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/UI/LanguageSelector';
import { Settings, Globe, User, Bell, Shield, HelpCircle } from 'lucide-react';

function SettingsPage() {
  const { t } = useTranslation();
  const { currentLanguage, getCurrentLanguageDetails } = useLanguage();
  const currentLanguageDetails = getCurrentLanguageDetails();

  const settingsSections = [
    {
      id: 'general',
      title: t('settings.general'),
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          label: t('settings.language'),
          description: `${t('settings.selectLanguage')} - ${currentLanguageDetails.nativeName}`,
          component: (
            <LanguageSelector 
              variant="default" 
              className="w-full max-w-xs"
              dropdownAlign="right"
            />
          )
        }
      ]
    },
    {
      id: 'profile',
      title: t('profile.personalInfo'),
      icon: <User className="w-5 h-5" />,
      items: [
        {
          label: t('profile.updateProfile'),
          description: t('profile.personalInfo'),
          action: 'profile'
        }
      ]
    },
    {
      id: 'notifications',
      title: t('settings.notifications'),
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          label: t('profile.whatsappUpdates'),
          description: 'WhatsApp notifications',
          toggle: true
        },
        {
          label: t('profile.emailUpdates'),
          description: 'Email notifications',
          toggle: true
        }
      ]
    },
    {
      id: 'help',
      title: t('settings.support'),
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          label: t('settings.support'),
          description: 'Get help and support',
          action: 'support'
        },
        {
          label: t('settings.privacy'),
          description: 'Privacy policy',
          action: 'privacy'
        },
        {
          label: t('settings.terms'),
          description: 'Terms of service',
          action: 'terms'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
              <p className="text-sm text-gray-600">
                {t('profile.preferences')} - {currentLanguageDetails.nativeName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Section Items */}
              <div className="divide-y divide-gray-100">
                {section.items.map((item, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-900">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        {item.component && item.component}
                        
                        {item.toggle && (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        )}
                        
                        {item.action && (
                          <button className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                            {t('common.edit')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Language Demo Section */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg text-white">
            <div className="px-6 py-8">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-8 h-8" />
                <h2 className="text-xl font-bold">{t('settings.changeLanguage')}</h2>
              </div>
              <p className="text-green-100 mb-6">
                {t('splash.aboutApp')}
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm mb-2">
                  <strong>{t('common.success')}:</strong> {t('messages.saved')}
                </p>
                <p className="text-sm">
                  <strong>{t('settings.language')}:</strong> {currentLanguageDetails.nativeName} ({currentLanguageDetails.name})
                </p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                KrishiMitra AI
              </h3>
              <p className="text-sm text-gray-500">
                {t('settings.version')} 1.0.0 | {t('splash.welcomeSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;