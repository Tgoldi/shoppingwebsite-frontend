import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
    const { isAuthenticated, logout } = useAuth();

    return (
        <>
            <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />
            <main>{children}</main>
        </>
    );
}

export default Layout;
