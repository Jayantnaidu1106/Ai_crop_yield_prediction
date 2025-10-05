// src/hooks/useFormValidation.js

import { useState } from 'react';

/**
 * Phone number validation (E.164 format)
 */
const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'Phone number is required';
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return 'Invalid phone number format. Please use format like +919876543210';
    }
    return null;
};

/**
 * Email validation (optional field)
 */
const validateEmail = (email) => {
    if (!email) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    return null;
};

/**
 * Location validation
 */
const validateLocation = (location) => {
    const errors = [];
    
    if (!location) {
        errors.push('Location is required');
        return errors;
    }
    
    if (!location.state || location.state.trim() === '') {
        errors.push('State is required');
    }
    
    if (!location.district || location.district.trim() === '') {
        errors.push('District is required');
    }
    
    if (location.pincode && !/^[1-9][0-9]{5}$/.test(location.pincode)) {
        errors.push('Invalid pincode format (should be 6 digits)');
    }
    
    return errors;
};

/**
 * Custom hook for client-side form validation across multiple inputs.
 * This is crucial for the multi-step sign-up forms.
 */
export const useFormValidation = () => {
    const [errors, setErrors] = useState({});

    /**
     * Validates form data based on our backend schema requirements
     * @param {object} formData - The current state of the form data.
     * @param {string[]} fieldsToValidate - Array of field names to check.
     * @returns {boolean} - True if all validated fields pass, false otherwise.
     */
    const validate = (formData, fieldsToValidate) => {
        let newErrors = {};
        let isValid = true;

        fieldsToValidate.forEach(field => {
            let errorMessage = null;

            switch (field) {
                case 'fullName':
                    if (!formData.fullName || formData.fullName.trim() === '') {
                        errorMessage = 'Full name is required';
                    } else if (formData.fullName.trim().length > 100) {
                        errorMessage = 'Full name must be less than 100 characters';
                    }
                    break;

                case 'phoneNumber':
                    errorMessage = validatePhoneNumber(formData.phoneNumber);
                    break;

                case 'recoveryEmail':
                    errorMessage = validateEmail(formData.recoveryEmail);
                    break;

                case 'farmSize':
                    if (formData.farmSize && parseFloat(formData.farmSize) < 0.1) {
                        errorMessage = 'Farm size must be at least 0.1 acres';
                    }
                    break;

                case 'farmingExperience':
                    if (formData.farmingExperience) {
                        const exp = parseInt(formData.farmingExperience);
                        if (exp < 0 || exp > 100) {
                            errorMessage = 'Farming experience must be between 0 and 100 years';
                        }
                    }
                    break;

                case 'location':
                    const locationErrors = validateLocation(formData.farmLocation);
                    if (locationErrors.length > 0) {
                        errorMessage = locationErrors.join(', ');
                    }
                    break;

                case 'primaryCrop':
                    if (!formData.primaryCrop || formData.primaryCrop.trim() === '') {
                        errorMessage = 'Primary crop selection is required';
                    }
                    break;

                default:
                    break;
            }

            if (errorMessage) {
                newErrors[field] = errorMessage;
                isValid = false;
            }
        });

        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    /**
     * Validates complete signup data
     */
    const validateSignupData = (formData) => {
        return validate(formData, [
            'fullName', 
            'phoneNumber', 
            'recoveryEmail', 
            'farmSize', 
            'farmingExperience', 
            'location', 
            'primaryCrop'
        ]);
    };

    // Clears errors for specific fields
    const clearError = (field) => {
        setErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    };

    return { 
        errors, 
        validate, 
        validateSignupData, 
        clearError,
        validatePhoneNumber,
        validateEmail,
        validateLocation
    };
};