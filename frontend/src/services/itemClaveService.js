import api from './api';

const itemClaveService = {
    /**
     * Obtener puntos clave de un evento (Cotización)
     */
    getByEvent: async (cotId) => {
        const response = await api.get(`/items-clave/${cotId}`);
        return response.data;
    },

    /**
     * Crear o actualizar punto clave
     */
    save: async (data) => {
        const response = await api.post('/items-clave', data);
        return response.data;
    },

    /**
     * Alternar estado de completado
     */
    toggle: async (id) => {
        const response = await api.patch(`/items-clave/${id}/toggle`);
        return response.data;
    },

    /**
     * Eliminar un punto clave
     */
    delete: async (id) => {
        const response = await api.delete(`/items-clave/${id}`);
        return response.data;
    }
};

export default itemClaveService;
