import api from './api';

export const authService = {
    login: async (email, password, rememberMe) => {
        const response = await api.post('/api/auth/login', {
            email,
            password,
            rememberMe
        });
        return response.data;
    },
    
    // Future expansion (e.g. register, reset password) can go here
};
