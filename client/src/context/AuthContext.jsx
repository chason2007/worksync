import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');

            if (token) {
                try {
                    console.log("Checking user against:", import.meta.env.VITE_API_URL);
                    const userRes = await api.get('/api/auth/user');
                    console.log("User found:", userRes.data);
                    setUser(userRes.data);

                    // Update whichever storage has the token
                    if (localStorage.getItem('auth-token')) {
                        localStorage.setItem('user', JSON.stringify(userRes.data));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(userRes.data));
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    if (error.code === 'ECONNABORTED') {
                        console.error("Request timed out");
                    }
                    // Invalid token, clear all
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('auth-token');
                    sessionStorage.removeItem('user');
                    setUser(null);
                }
            } else {
                console.log("No token found");
                setUser(null);
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = (token, userData, rememberMe = true) => {
        // Clear potential old session in other storage
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('user');

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('auth-token', token);
        storage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    const value = useMemo(() => ({
        user,
        login,
        logout,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: 'var(--pk-bg)',
                    color: 'var(--pk-primary)',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div className="btn loading" style={{ width: '40px', height: '40px', background: 'transparent' }}></div>
                    <p style={{ fontWeight: 500 }}>Loading WorkSync...</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
