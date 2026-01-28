import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('auth-token');

            if (token) {
                try {
                    const userRes = await axios.get('http://localhost:5001/api/auth/user', {
                        headers: { 'auth-token': token }
                    });
                    setUser(userRes.data);
                    // Update local storage user just in case
                    localStorage.setItem('user', JSON.stringify(userRes.data));
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    // If token is invalid, clear it
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
