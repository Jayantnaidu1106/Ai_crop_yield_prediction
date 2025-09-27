// src/components/common/Card.jsx
import React from 'react';

/**
 * Reusable Card Component for displaying metrics and content.
 */
function Card({ title, variant = 'default', children }) {
    const className = `card-container ${variant}`;

    return (
        <div className={className}>
            {title && (
                <div className="card-header">
                    <h3>{title}</h3>
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}

export default Card;