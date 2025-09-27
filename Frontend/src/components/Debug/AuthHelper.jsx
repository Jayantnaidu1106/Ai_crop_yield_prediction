// components/Debug/AuthHelper.jsx
// Debug component to help with authentication testing

import React, { useState } from 'react';
import { useAuth } from '../../context/authcontext';

const AuthHelper = () => {
    const { isAuthenticated, authToken, login, logout } = useAuth();
    const [showHelper, setShowHelper] = useState(false);

    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ3YjJhYmQyZmExMWVkYTMyZjBlNjgiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwiaXNPVFBWZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNzU4OTY2ODcxLCJleHAiOjE3NTk1NzE2NzF9.1s-c0WkaFE2ZhcRyjzwD02jPSMHCaXLFvqtqHQepPc0";

    const handleSetTestToken = () => {
        login(testToken);
        console.log('✅ Test token set successfully');
        window.location.reload();
    };

    const handleClearToken = () => {
        logout();
        console.log('🗑️ Token cleared');
        window.location.reload();
    };

    const checkTokenInStorage = () => {
        const token = localStorage.getItem('token');
        console.log('🔍 Token in localStorage:', token ? 'Present' : 'Missing');
        console.log('🔍 Auth context token:', authToken ? 'Present' : 'Missing');
        console.log('🔍 Is authenticated:', isAuthenticated);
        return token;
    };

    if (!showHelper) {
        return (
            <div 
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    zIndex: 9999,
                    backgroundColor: '#f0f0f0',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: '1px solid #ccc'
                }}
                onClick={() => setShowHelper(true)}
            >
                🔧 Debug
            </div>
        );
    }

    return (
        <div 
            style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                zIndex: 9999,
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '2px solid #007bff',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                minWidth: '300px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#007bff' }}>🔧 Auth Debug Helper</h4>
                <button 
                    onClick={() => setShowHelper(false)}
                    style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Status:</strong>
                <div style={{ color: isAuthenticated ? 'green' : 'red' }}>
                    {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                    Token: {authToken ? 'Present' : 'Missing'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                <button
                    onClick={handleSetTestToken}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                    }}
                >
                    🔑 Set Test Token
                </button>

                <button
                    onClick={handleClearToken}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                    }}
                >
                    🗑️ Clear Token
                </button>

                <button
                    onClick={checkTokenInStorage}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                    }}
                >
                    🔍 Check Token
                </button>
            </div>

            <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
                <strong>Test User:</strong> +1234567890<br/>
                <strong>Valid until:</strong> 7 days
            </div>
        </div>
    );
};

export default AuthHelper;
