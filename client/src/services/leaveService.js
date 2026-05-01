import api from './api';

export const leaveService = {
    getLeaves: async (page = 1, limit = 10) => {
        const response = await api.get(`/api/leaves?page=${page}&limit=${limit}`);
        return response.data;
    },
    
    submitLeave: async (reason, startDate, endDate) => {
        const response = await api.post('/api/leaves', {
            reason,
            startDate,
            endDate
        });
        return response.data;
    },
    
    cancelLeave: async (leaveId) => {
        const response = await api.delete(`/api/leaves/${leaveId}`);
        return response.data;
    },
    
    // For admin
    updateLeaveStatus: async (leaveId, status) => {
        const response = await api.put(`/api/leaves/${leaveId}`, { status });
        return response.data;
    }
};
