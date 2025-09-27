// src/components/common/Button.jsx
import React from 'react';

/**
 * Reusable Button Component
 */
function Button({ children, variant = 'cta', onClick, disabled = false, type = 'button' }) {
    const className = `btn ${variant}`; 

    return (
        <button
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </button>
    );
}

export default Button;