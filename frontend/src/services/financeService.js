import api from './api';

const financeService = {
    /**
     * Obtener el resumen financiero detallado de un cliente
     */
    getClientSummary: async (cliId) => {
        const response = await api.get(`/client-finance/${cliId}`);
        return response.data;
    },
    getClientEvents: async (cliId) => {
        const response = await api.get(`/dashboard/client/events/${cliId}`);
        return response.data;
    },
    getEventSummary: async (cotId) => {
        const response = await api.get(`/client-finance/event/${cotId}`);
        return response.data;
    }
};

export default financeService;
