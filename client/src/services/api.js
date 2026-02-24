import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
        if (token) {
            config.headers['auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('auth-token');
            sessionStorage.removeItem('user');
            globalThis.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
