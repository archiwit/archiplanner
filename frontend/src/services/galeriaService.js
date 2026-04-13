import api from './api';

const galeriaService = {
    getCategorias: async () => {
        const res = await api.get('/galeria/categorias');
        return res.data;
    },
    getEventos: async () => {
        const res = await api.get('/galeria/eventos');
        return res.data;
    },
    getEventoMedia: async (id) => {
        const res = await api.get(`/galeria/eventos/${id}`);
        return res.data;
    }
};

export default galeriaService;
