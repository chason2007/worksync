import api from './api';

export const userService = {
    getProfile: async () => {
        const response = await api.get('/api/users/profile');
        return response.data;
    },
    
    updateProfile: async (data) => {
        const response = await api.put('/api/users/profile', data);
        return response.data;
    },
    
    uploadProfileImage: async (formData) => {
        const response = await api.post('/api/users/profile/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    
    checkEmployeeId: async (id) => {
        const response = await api.get(`/api/users/check-id/${id}`);
        return response.data;
    },
    
    getNextEmployeeId: async () => {
        const response = await api.get('/api/users/next-id');
        return response.data;
    }
};
