import api from './api';

const invitadoService = {
    getByEvent: (cotId) => api.get(`/invitados/${cotId}`).then(res => res.data),
    saveBulk: (cotId, invitados) => api.post('/invitados', { cot_id: cotId, invitados }).then(res => res.data),
    update: (id, data) => api.put(`/invitados/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/invitados/${id}`).then(res => res.data)
};

export default invitadoService;
