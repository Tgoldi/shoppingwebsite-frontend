import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? (
        children
    ) : (
        <Navigate to="/login" state={{ from: location, message: "Please log in to access this page" }} replace />
    );
};

export default PrivateRoute;