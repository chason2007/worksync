import api from './api';

export const adminService = {
    getStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data;
    },
    
    getAllUsers: async () => {
        const response = await api.get('/api/admin/users');
        return response.data;
    },
    
    updateUser: async (userId, data) => {
        const response = await api.put(`/api/admin/users/${userId}`, data);
        return response.data;
    },
    
    deleteUser: async (userId) => {
        const response = await api.delete(`/api/admin/users/${userId}`);
        return response.data;
    },
    
    resetUserPassword: async (userId, newPassword) => {
        const response = await api.put(`/api/admin/users/${userId}/reset-password`, { newPassword });
        return response.data;
    },
    
    uploadUserImage: async (userId, formData) => {
        const response = await api.post(`/api/admin/users/${userId}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteAllUsers: async () => {
        const response = await api.delete('/api/admin/users');
        return response.data;
    },

    deleteAllAttendance: async () => {
        const response = await api.delete('/api/admin/attendance');
        return response.data;
    },

    deleteAllLeaves: async () => {
        const response = await api.delete('/api/admin/leaves');
        return response.data;
    },

    resetSystem: async () => {
        const response = await api.post('/api/admin/reset-system');
        return response.data;
    }
};
