// src/components/UI/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
    const spinnerStyles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: size === 'small' ? '10px' : '20px'
        },
        spinner: {
            width: size === 'small' ? '16px' : size === 'large' ? '32px' : '20px',
            height: size === 'small' ? '16px' : size === 'large' ? '32px' : '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    return (
        <div style={spinnerStyles.container}>
            <div style={spinnerStyles.spinner}></div>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingSpinner;