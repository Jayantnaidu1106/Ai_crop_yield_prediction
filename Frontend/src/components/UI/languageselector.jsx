// src/components/common/LanguageSelector.jsx
import React, { useState } from 'react';

function LanguageSelector() {
    const [selectedLang, setSelectedLang] = useState('English');

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी (Hindi)' },
        { code: 'mr', name: 'मराठी (Marathi)' },
        { code: 'te', name: 'తెలుగు (Telugu)' },
    ];

    const handleChange = (e) => {
        const langName = e.target.value;
        setSelectedLang(langName);
        
        // **TODO:** Implement i18n logic here to change app language
        console.log(`Language switched to: ${langName}`);
    };

    return (
        <select 
            className="language-selector-dropdown" 
            value={selectedLang} 
            onChange={handleChange}
            aria-label="Select Application Language"
        >
            {languages.map((lang) => (
                <option key={lang.code} value={lang.name}>
                    {lang.name}
                </option>
            ))}
        </select>
    );
}

export default LanguageSelector;