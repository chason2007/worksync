import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: { 'auth-token': token }
            });
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
                {},
                { headers: { 'auth-token': token } }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
                {},
                { headers: { 'auth-token': token } }
            );

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const clearAllNotifications = async () => {
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/notifications/clear-all`,
                { headers: { 'auth-token': token } }
            );

            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    // Fetch notifications on mount and when user changes
    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications(prev => prev.length === 0 ? prev : []);
            setUnreadCount(prev => prev === 0 ? prev : 0);
        }
    }, [user]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [user]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAllNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
