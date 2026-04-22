import api from './api';

const clienteService = {
    getAll: async () => {
        const res = await api.get('/clientes');
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/clientes/${id}`);
        return res.data;
    },
    create: async (data) => {
        const res = await api.post('/clientes', data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.put(`/clientes/${id}`, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/clientes/${id}`);
        return res.data;
    }
};

export default clienteService;
