import api from './api';

const alertasService = {
    getAll: async (uId, rol) => {
        const response = await api.get('/alertas', { params: { u_id: uId, rol } });
        return response.data;
    },
    getUnreadCount: async (uId, rol) => {
        const response = await api.get('/alertas/unread-count', { params: { u_id: uId, rol } });
        return response.data.count;
    },
    markAsRead: async (id) => {
        const response = await api.post(`/alertas/read/${id}`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.post('/alertas/read-all');
        return response.data;
    }
};

export default alertasService;
