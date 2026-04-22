import api from './api';

const cotizacionService = {
    /**
     * Obtener todas las cotizaciones
     */
    getAll: async () => {
        const response = await api.get('/cotizaciones');
        return response.data;
    },

    /**
     * Obtener cotizaciones de un cliente específico
     */
    getByClient: async (cliId) => {
        const response = await api.get(`/cotizaciones?cli_id=${cliId}`);
        return response.data;
    },

    /**
     * Obtener una cotización por ID
     */
    getById: async (id) => {
        const response = await api.get(`/cotizaciones/${id}`);
        return response.data;
    }
};

export default cotizacionService;
