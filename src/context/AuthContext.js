import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUserProfile, storeAuthTokens } from '../utils/api';
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        try {
            const userProfile = await getUserProfile();
            setUser(userProfile);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
            apiLogout();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (email, password) => {
    try {
        const response = await apiLogin(email, password);
        if (response.data && response.data.token) {
            storeAuthTokens(response.data.token, response.data.refreshToken);
            setIsAuthenticated(true);
            const userProfile = await getUserProfile();
            setUser(userProfile);
        } else {
            throw new Error('No token received from server');
        }
    } catch (error) {
        console.error('Login error:', error);
        setIsAuthenticated(false);
        setUser(null);
        throw error;
    }
};

    const register = async (userData) => {
        try {
            await apiRegister(userData);
            await login(userData.email, userData.password);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        apiLogout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout: handleLogout, loading, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
}