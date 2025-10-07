// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ta, te, mr } from './translations/additionalLanguages';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        back: "Back",
        next: "Next",
        submit: "Submit",
        close: "Close",
        yes: "Yes",
        no: "No",
        optional: "Optional",
        required: "Required"
      },

      // Navigation & Layout
      nav: {
        home: "Home",
        dashboard: "Dashboard",
        weather: "Weather",
        predictions: "Predictions",
        recommendations: "Recommendations",
        profile: "Profile",
        logout: "Logout",
        settings: "Settings"
      },

      // Authentication
      auth: {
        welcome: "Welcome to KrishiMitra AI",
        signUp: "Sign Up",
        signIn: "Sign In",
        logout: "Logout",
        phoneNumber: "Phone Number",
        fullName: "Full Name",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot Password?",
        alreadyHaveAccount: "Already have an account? Sign In",
        dontHaveAccount: "Don't have an account? Sign Up",
        enterOTP: "Enter OTP",
        otpSentTo: "OTP sent to",
        verifyOTP: "Verify OTP",
        resendOTP: "Resend OTP",
        otpVerification: "OTP Verification",
        verifyPhoneNumber: "Verify Your Phone Number",
        sendOTP: "Send OTP",
        didntReceiveCode: "Didn't receive code? Resend OTP"
      },

      // Splash Page
      splash: {
        welcomeTitle: "Welcome to KrishiMitra AI",
        welcomeSubtitle: "Your Smart Farming Companion",
        selectLanguage: "Select Your Language",
        getStarted: "Get Started",
        aboutApp: "Empowering farmers with AI-driven insights for better crop yields",
        features: {
          weather: "Real-time Weather Updates",
          predictions: "AI Crop Yield Predictions", 
          recommendations: "Smart Farming Recommendations",
          market: "Market Price Analysis"
        }
      },

      // Signup Steps
      signup: {
        step1: {
          title: "Join Us!",
          subtitle: "Step 1 of 3: Your Contact",
          fullNamePlaceholder: "Full Name",
          phonePlaceholder: "Mobile Number",
          whatsappUpdates: "Receive WhatsApp updates",
          sendOTP: "Send OTP",
          sendingOTP: "Sending OTP..."
        },
        step2: {
          title: "Verify Your Number",
          subtitle: "Step 2 of 3: Enter the OTP sent to",
          otpPlaceholder: "000000",
          otpInstructions: "Enter the 6-digit code sent to your phone",
          verifying: "Verifying...",
          verifyContinue: "Verify & Continue"
        },
        step3: {
          title: "Step 3 of 3: Farm Details",
          subtitle: "Final step: Tailor the AI insights to your field",
          farmSizePlaceholder: "Farm Size (Acres)",
          farmLocation: "Farm Location:",
          useCurrentLocation: "Use Current Location",
          gettingLocation: "Getting Location...",
          statePlaceholder: "State *",
          districtPlaceholder: "District *",
          villagePlaceholder: "Village (Optional)",
          pincodePlaceholder: "Pincode (Optional)",
          addressPlaceholder: "Full Address (Optional)",
          recoveryEmailPlaceholder: "Recovery Email (Optional)",
          primaryCrop: "Primary Crop:",
          selectPrimaryCrop: "Select Primary Crop",
          farmingExperiencePlaceholder: "Farming Experience (Years, Optional)",
          finishSetup: "Finish Setup",
          completing: "Completing..."
        }
      },

      // Dashboard
      dashboard: {
        title: "Dashboard",
        welcome: "Welcome back",
        quickStats: "Quick Stats",
        recentActivities: "Recent Activities",
        weatherOverview: "Weather Overview",
        currentWeather: "Current Weather",
        forecast: "7-Day Forecast",
        yieldPredictions: "Yield Predictions",
        recommendations: "Smart Recommendations",
        viewAll: "View All",
        noData: "No data available",
        lastUpdated: "Last updated"
      },

      // Weather
      weather: {
        current: "Current Weather",
        forecast: "Weather Forecast",
        temperature: "Temperature",
        humidity: "Humidity",
        windSpeed: "Wind Speed",
        rainfall: "Rainfall",
        pressure: "Pressure",
        visibility: "Visibility",
        uvIndex: "UV Index",
        feelsLike: "Feels like",
        weatherAlerts: "Weather Alerts",
        noAlerts: "No weather alerts",
        agriculturalWeather: "Agricultural Weather",
        sowingConditions: "Sowing Conditions",
        irrigationAdvice: "Irrigation Advice",
        pestRisk: "Pest Risk"
      },

      // Crops (Hindi names in parentheses)
      crops: {
        rice: "Rice (धान)",
        wheat: "Wheat (गेहूं)",
        cotton: "Cotton (कपास)",
        sugarcane: "Sugarcane (गन्ना)",
        maize: "Maize (मक्का)",
        jowar: "Jowar (ज्वार)",
        bajra: "Bajra (बाजरा)",
        arhar: "Arhar (अरहर)",
        groundnut: "Groundnut (मूंगफली)",
        soybean: "Soybean (सोयाबीन)",
        other: "Other"
      },

      // Farm Management
      farm: {
        farmDetails: "Farm Details",
        farmSize: "Farm Size",
        primaryCrop: "Primary Crop",
        farmingExperience: "Farming Experience",
        location: "Location",
        state: "State",
        district: "District",
        village: "Village",
        pincode: "Pincode",
        coordinates: "Coordinates",
        updateLocation: "Update Location"
      },

      // Predictions
      predictions: {
        title: "Yield Predictions",
        newPrediction: "New Prediction",
        cropType: "Crop Type",
        season: "Season",
        predictedYield: "Predicted Yield",
        confidence: "Confidence",
        accuracy: "Accuracy",
        actualYield: "Actual Yield",
        viewDetails: "View Details",
        noPredictions: "No predictions found"
      },

      // Recommendations
      recommendations: {
        title: "Smart Recommendations",
        highPriority: "High Priority",
        category: "Category",
        priority: "Priority",
        status: "Status",
        pending: "Pending",
        inProgress: "In Progress",
        completed: "Completed",
        dismissed: "Dismissed",
        markAsComplete: "Mark as Complete",
        provideFeedback: "Provide Feedback",
        helpful: "Helpful",
        notHelpful: "Not Helpful",
        noRecommendations: "No recommendations found"
      },

      // Profile
      profile: {
        title: "Profile",
        personalInfo: "Personal Information",
        contactInfo: "Contact Information",
        farmInfo: "Farm Information",
        preferences: "Preferences",
        language: "Language",
        notifications: "Notifications",
        whatsappUpdates: "WhatsApp Updates",
        emailUpdates: "Email Updates",
        updateProfile: "Update Profile",
        changeLanguage: "Change Language"
      },

      // Settings
      settings: {
        title: "Settings",
        general: "General",
        notifications: "Notifications", 
        language: "Language",
        changeLanguage: "Change Language",
        selectLanguage: "Select Language",
        about: "About",
        version: "Version",
        support: "Support",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
      },

      // Messages
      messages: {
        networkError: "Network error. Please check your connection.",
        invalidInput: "Please check your input and try again.",
        success: "Operation completed successfully",
        error: "An error occurred. Please try again.",
        saved: "Changes saved successfully",
        deleted: "Item deleted successfully",
        updated: "Updated successfully",
        loginRequired: "Please login to continue",
        phoneRequired: "Phone number is required",
        nameRequired: "Full name is required",
        locationRequired: "Location is required",
        invalidPhone: "Invalid phone number format",
        invalidEmail: "Invalid email format",
        otpRequired: "OTP is required",
        invalidOTP: "Invalid OTP code"
      }
    }
  },

  hi: {
    translation: {
      // Common
      common: {
        loading: "लोड हो रहा है...",
        error: "त्रुटि",
        success: "सफलता",
        cancel: "रद्द करें",
        save: "सेव करें",
        delete: "मिटाएं",
        edit: "संपादित करें",
        back: "वापस",
        next: "आगे",
        submit: "जमा करें",
        close: "बंद करें",
        yes: "हां",
        no: "नहीं",
        optional: "वैकल्पिक",
        required: "आवश्यक"
      },

      // Navigation & Layout
      nav: {
        home: "होम",
        dashboard: "डैशबोर्ड",
        weather: "मौसम",
        predictions: "भविष्यवाणी",
        recommendations: "सुझाव",
        profile: "प्रोफाइल",
        logout: "लॉगआउट",
        settings: "सेटिंग्स"
      },

      // Authentication
      auth: {
        welcome: "कृषि मित्र AI में आपका स्वागत है",
        signUp: "साइन अप",
        signIn: "साइन इन",
        logout: "लॉगआउट",
        phoneNumber: "फोन नंबर",
        fullName: "पूरा नाम",
        password: "पासवर्ड",
        confirmPassword: "पासवर्ड की पुष्टि करें",
        forgotPassword: "पासवर्ड भूल गए?",
        alreadyHaveAccount: "पहले से खाता है? साइन इन करें",
        dontHaveAccount: "खाता नहीं है? साइन अप करें",
        enterOTP: "OTP दर्ज करें",
        otpSentTo: "OTP भेजा गया",
        verifyOTP: "OTP सत्यापित करें",
        resendOTP: "OTP फिर से भेजें",
        otpVerification: "OTP सत्यापन",
        verifyPhoneNumber: "अपना फोन नंबर सत्यापित करें",
        sendOTP: "OTP भेजें",
        didntReceiveCode: "कोड नहीं मिला? OTP फिर से भेजें"
      },

      // Splash Page
      splash: {
        welcomeTitle: "कृषि मित्र AI में आपका स्वागत है",
        welcomeSubtitle: "आपका स्मार्ट खेती साथी",
        selectLanguage: "अपनी भाषा चुनें",
        getStarted: "शुरू करें",
        aboutApp: "बेहतर फसल उत्पादन के लिए AI संचालित जानकारी के साथ किसानों को सशक्त बनाना",
        features: {
          weather: "वास्तविक समय मौसम अपडेट",
          predictions: "AI फसल उत्पादन भविष्यवाणी",
          recommendations: "स्मार्ट खेती सुझाव",
          market: "बाजार मूल्य विश्लेषण"
        }
      },

      // Signup Steps
      signup: {
        step1: {
          title: "हमसे जुड़ें!",
          subtitle: "चरण 1 का 3: आपका संपर्क",
          fullNamePlaceholder: "पूरा नाम",
          phonePlaceholder: "मोबाइल नंबर",
          whatsappUpdates: "WhatsApp अपडेट प्राप्त करें",
          sendOTP: "OTP भेजें",
          sendingOTP: "OTP भेजा जा रहा है..."
        },
        step2: {
          title: "अपना नंबर सत्यापित करें",
          subtitle: "चरण 2 का 3: भेजा गया OTP दर्ज करें",
          otpPlaceholder: "000000",
          otpInstructions: "अपने फोन पर भेजा गया 6-अंकीय कोड दर्ज करें",
          verifying: "सत्यापित कर रहे हैं...",
          verifyContinue: "सत्यापित करें और जारी रखें"
        },
        step3: {
          title: "चरण 3 का 3: खेत विवरण",
          subtitle: "अंतिम चरण: AI जानकारी को अपने खेत के लिए तैयार करें",
          farmSizePlaceholder: "खेत का आकार (एकड़)",
          farmLocation: "खेत का स्थान:",
          useCurrentLocation: "वर्तमान स्थान का उपयोग करें",
          gettingLocation: "स्थान प्राप्त कर रहे हैं...",
          statePlaceholder: "राज्य *",
          districtPlaceholder: "जिला *",
          villagePlaceholder: "गांव (वैकल्पिक)",
          pincodePlaceholder: "पिनकोड (वैकल्पिक)",
          addressPlaceholder: "पूरा पता (वैकल्पिक)",
          recoveryEmailPlaceholder: "रिकवरी ईमेल (वैकल्पिक)",
          primaryCrop: "मुख्य फसल:",
          selectPrimaryCrop: "मुख्य फसल चुनें",
          farmingExperiencePlaceholder: "खेती का अनुभव (वर्ष, वैकल्पिक)",
          finishSetup: "सेटअप पूरा करें",
          completing: "पूरा कर रहे हैं..."
        }
      },

      // Dashboard
      dashboard: {
        title: "डैशबोर्ड",
        welcome: "वापसी पर स्वागत है",
        quickStats: "त्वरित आंकड़े",
        recentActivities: "हाल की गतिविधियां",
        weatherOverview: "मौसम अवलोकन",
        currentWeather: "वर्तमान मौसम",
        forecast: "7-दिन का पूर्वानुमान",
        yieldPredictions: "उत्पादन भविष्यवाणी",
        recommendations: "स्मार्ट सुझाव",
        viewAll: "सभी देखें",
        noData: "कोई डेटा उपलब्ध नहीं",
        lastUpdated: "अंतिम अपडेट"
      },

      // Weather
      weather: {
        current: "वर्तमान मौसम",
        forecast: "मौसम पूर्वानुमान",
        temperature: "तापमान",
        humidity: "आर्द्रता",
        windSpeed: "हवा की गति",
        rainfall: "वर्षा",
        pressure: "दबाव",
        visibility: "दृश्यता",
        uvIndex: "UV सूचकांक",
        feelsLike: "महसूस होता है",
        weatherAlerts: "मौसम चेतावनी",
        noAlerts: "कोई मौसम चेतावनी नहीं",
        agriculturalWeather: "कृषि मौसम",
        sowingConditions: "बुआई की स्थिति",
        irrigationAdvice: "सिंचाई सलाह",
        pestRisk: "कीट जोखिम"
      },

      // Crops (with Hindi names)
      crops: {
        rice: "चावल (धान)",
        wheat: "गेहूं",
        cotton: "कपास",
        sugarcane: "गन्ना",
        maize: "मक्का",
        jowar: "ज्वार",
        bajra: "बाजरा",
        arhar: "अरहर",
        groundnut: "मूंगफली",
        soybean: "सोयाबीन",
        other: "अन्य"
      },

      // Farm Management
      farm: {
        farmDetails: "खेत विवरण",
        farmSize: "खेत का आकार",
        primaryCrop: "मुख्य फसल",
        farmingExperience: "खेती का अनुभव",
        location: "स्थान",
        state: "राज्य",
        district: "जिला",
        village: "गांव",
        pincode: "पिनकोड",
        coordinates: "निर्देशांक",
        updateLocation: "स्थान अपडेट करें"
      },

      // Predictions
      predictions: {
        title: "उत्पादन भविष्यवाणी",
        newPrediction: "नई भविष्यवाणी",
        cropType: "फसल प्रकार",
        season: "मौसम",
        predictedYield: "अनुमानित उत्पादन",
        confidence: "विश्वास",
        accuracy: "सटीकता",
        actualYield: "वास्तविक उत्पादन",
        viewDetails: "विवरण देखें",
        noPredictions: "कोई भविष्यवाणी नहीं मिली"
      },

      // Recommendations
      recommendations: {
        title: "स्मार्ट सुझाव",
        highPriority: "उच्च प्राथमिकता",
        category: "श्रेणी",
        priority: "प्राथमिकता",
        status: "स्थिति",
        pending: "लंबित",
        inProgress: "प्रगति में",
        completed: "पूर्ण",
        dismissed: "खारिज",
        markAsComplete: "पूर्ण के रूप में चिह्नित करें",
        provideFeedback: "फीडबैक दें",
        helpful: "सहायक",
        notHelpful: "सहायक नहीं",
        noRecommendations: "कोई सुझाव नहीं मिले"
      },

      // Profile
      profile: {
        title: "प्रोफाइल",
        personalInfo: "व्यक्तिगत जानकारी",
        contactInfo: "संपर्क जानकारी",
        farmInfo: "खेत जानकारी",
        preferences: "प्राथमिकताएं",
        language: "भाषा",
        notifications: "सूचनाएं",
        whatsappUpdates: "WhatsApp अपडेट",
        emailUpdates: "ईमेल अपडेट",
        updateProfile: "प्रोफाइल अपडेट करें",
        changeLanguage: "भाषा बदलें"
      },

      // Settings
      settings: {
        title: "सेटिंग्स",
        general: "सामान्य",
        notifications: "सूचनाएं",
        language: "भाषा",
        changeLanguage: "भाषा बदलें",
        selectLanguage: "भाषा चुनें",
        about: "के बारे में",
        version: "संस्करण",
        support: "सहायता",
        privacy: "गोपनीयता नीति",
        terms: "सेवा की शर्तें"
      },

      // Messages
      messages: {
        networkError: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।",
        invalidInput: "कृपया अपना इनपुट जांचें और फिर से कोशिश करें।",
        success: "ऑपरेशन सफलतापूर्वक पूरा हुआ",
        error: "एक त्रुटि हुई। कृपया फिर से कोशिश करें।",
        saved: "परिवर्तन सफलतापूर्वक सहेजे गए",
        deleted: "आइटम सफलतापूर्वक मिटाया गया",
        updated: "सफलतापूर्वक अपडेट किया गया",
        loginRequired: "कृपया जारी रखने के लिए लॉगिन करें",
        phoneRequired: "फोन नंबर आवश्यक है",
        nameRequired: "पूरा नाम आवश्यक है",
        locationRequired: "स्थान आवश्यक है",
        invalidPhone: "अवैध फोन नंबर प्रारूप",
        invalidEmail: "अवैध ईमेल प्रारूप",
        otpRequired: "OTP आवश्यक है",
        invalidOTP: "अवैध OTP कोड"
      }
    }
  },

  // Tamil translations
  ta,

  // Telugu translations  
  te,

  // Marathi translations
  mr

  // Add more regional languages as needed
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;