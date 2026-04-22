import api from './api';

const itinerarioService = {
    /**
     * Obtener el itinerario de un evento (Cotización)
     */
    getByEvent: async (cotId) => {
        const response = await api.get(`/itinerarios/${cotId}`);
        return response.data;
    },

    /**
     * Crear o actualizar un item de itinerario (Soporta FormData para foto)
     */
    save: async (data) => {
        const response = await api.post('/itinerarios', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Eliminar un item
     */
    delete: async (id) => {
        const response = await api.delete(`/itinerarios/${id}`);
        return response.data;
    }
};

export default itinerarioService;
