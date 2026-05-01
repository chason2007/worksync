import api from './api';

export const attendanceService = {
    getTodayAttendance: async (userId) => {
        const response = await api.get(`/api/attendance/today/${userId}`);
        return response.data;
    },
    
    getStats: async (userId) => {
        const response = await api.get(`/api/attendance/stats/${userId}`);
        return response.data;
    },
    
    markAttendance: async (status) => {
        const response = await api.post('/api/attendance/mark', { status });
        return response.data;
    },
    
    updateAttendance: async (recordId, status) => {
        const response = await api.put(`/api/attendance/${recordId}`, { status });
        return response.data;
    },
    
    getUserLogs: async (userId, page = 1, limit = 20) => {
        const response = await api.get(`/api/attendance/user/${userId}?page=${page}&limit=${limit}`);
        return response.data;
    },
    
    getAllLogs: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/api/attendance${queryString ? `?${queryString}` : ''}`);
        return response.data;
    }
};
