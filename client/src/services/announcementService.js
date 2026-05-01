import api from './api';

export const announcementService = {
    getAll: async () => {
        const response = await api.get('/api/announcements');
        return response.data;
    },
    
    getById: async (id) => {
        const response = await api.get(`/api/announcements/${id}`);
        return response.data;
    },
    
    create: async (title, content) => {
        const response = await api.post('/api/announcements', { title, content });
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/api/announcements/${id}`);
        return response.data;
    },
    
    deleteAll: async () => {
        const response = await api.delete('/api/announcements');
        return response.data;
    }
};
