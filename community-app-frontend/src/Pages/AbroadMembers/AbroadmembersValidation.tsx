import React from 'react';

interface ValidationErrorProps {
    message?: string;
    className?: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ message, className = '' }) => {
    if (!message) return null;

    return (
        <p className={`text-red-500 text-sm mt-1 ${className}`}>
            {message}
        </p>
    );
};

export default ValidationError;