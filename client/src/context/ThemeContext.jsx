import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Check localStorage first, default to 'system'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'system';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Remove previous theme class/attribute
        delete root.dataset.theme;

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.dataset.theme = systemTheme;
        } else {
            root.dataset.theme = theme;
        }

        // Save preference
        localStorage.setItem('app-theme', theme);

    }, [theme]);

    // Listen for system changes if mode is 'system'
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const systemTheme = mediaQuery.matches ? 'dark' : 'light';
            document.documentElement.dataset.theme = systemTheme;
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    return useContext(ThemeContext);
}

// Helper hook to sync theme with User Preference
// This should be used in a high-level component (e.g., App.jsx or MainLayout)
export function useThemeSync(user) {
    const { setTheme } = useTheme();

    useEffect(() => {
        if (user?.preferences?.theme) {
            setTheme(user.preferences.theme);
        }
    }, [user, setTheme]);
}
