import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const showSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(null), 3000);
    };

    const value = {
        loading,
        setLoading,
        error,
        setError,
        success,
        setSuccess,
        showError,
        showSuccess,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
