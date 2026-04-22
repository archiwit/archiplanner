import api from './api';

const paginasV4Service = {
    getAll: async () => {
        const response = await api.get('/paginas-v4');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/paginas-v4/${id}`);
        return response.data;
    },
    getBySlug: async (slug) => {
        const response = await api.get(`/paginas-v4/${slug}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/paginas-v4', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/paginas-v4/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/paginas-v4/${id}`);
        return response.data;
    },
    duplicate: async (id) => {
        const response = await api.post(`/paginas-v4/${id}/duplicate`);
        return response.data;
    },
    getMedia: async (params = {}) => {
        const { categoria = 'todas', tipo = 'todos', limit = 24, offset = 0 } = params;
        const response = await api.get('/paginas-v4/media', {
            params: { categoria, tipo, limit, offset }
        });
        return response.data;
    },
    setHomepage: async (id) => {
        const response = await api.post(`/paginas-v4/set-homepage/${id}`);
        return response.data;
    },
    submitContact: async (data) => {
        const response = await api.post('/paginas-v4/contact', data);
        return response.data;
    },
    uploadMedia: async (formData) => {
        const response = await api.post('/paginas-v4/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    syncMedia: async () => {
        const response = await api.post('/paginas-v4/media/sync');
        return response.data;
    }
};


export default paginasV4Service;
