import api from './api';

export const notificationService = {
    getAll: async () => {
        const response = await api.get('/api/notifications');
        return response.data;
    },
    
    markAsRead: async (id) => {
        const response = await api.put(`/api/notifications/${id}/read`);
        return response.data;
    },
    
    markAllAsRead: async () => {
        const response = await api.put('/api/notifications/mark-all-read');
        return response.data;
    },
    
    clearAll: async () => {
        const response = await api.delete('/api/notifications/clear-all');
        return response.data;
    }
};
