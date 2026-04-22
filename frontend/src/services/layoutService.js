import api from './api';

const layoutService = {
    getByEvent: (cotId) => api.get(`/layouts/${cotId}`).then(res => res.data),
    save: (data) => data.id 
        ? api.put(`/layouts/${data.id}`, data).then(res => res.data)
        : api.post('/layouts', data).then(res => res.data),
    getElements: (layoutId) => api.get(`/layout-elementos/${layoutId}`).then(res => res.data),
    saveElements: (layoutId, elementos) => api.post(`/layout-elementos/bulk/${layoutId}`, { elementos }).then(res => res.data),
    delete: (id) => api.post(`/layouts/delete/${id}`).then(res => res.data)
};

export default layoutService;
