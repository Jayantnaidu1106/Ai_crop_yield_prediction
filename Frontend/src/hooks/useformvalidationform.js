// src/hooks/useFormValidation.js

import { useState } from 'react';

/**
 * Custom hook for client-side form validation across multiple inputs.
 * This is crucial for the multi-step sign-up forms.
 */
export const useFormValidation = () => {
    const [errors, setErrors] = useState({});

    /**
     * Validates a single input field or a subset of form data.
     * @param {object} formData - The current state of the form data.
     * @param {string[]} fieldsToValidate - Array of field names to check (e.g., ['name', 'email']).
     * @returns {boolean} - True if all validated fields pass, false otherwise.
     */
    const validate = (formData, fieldsToValidate) => {
        let newErrors = {};
        let isValid = true;

        fieldsToValidate.forEach(field => {
            const value = formData[field] ? String(formData[field]).trim() : '';

            if (field === 'name' && !value) {
                newErrors.name = 'Full Name is required.';
                isValid = false;
            } else if (field === 'email' && value && !value.includes('@')) {
                newErrors.email = 'Invalid email format.';
                isValid = false;
            } else if (field === 'password' && value.length < 8) {
                newErrors.password = 'Password must be at least 8 characters.';
                isValid = false;
            }
            // Add more field-specific checks (e.g., farmSize > 0, location format)
        });

        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    // Clears errors for specific fields
    const clearError = (field) => {
        setErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    };

    return { errors, validate, clearError };
};