import api from './api';

const actividadService = {
    /**
     * Obtener todas las actividades
     */
    getAll: async (params = {}) => {
        const response = await api.get('/actividades', { params });
        return response.data;
    },

    /**
     * Crear una nueva actividad
     */
    create: async (data) => {
        const response = await api.post('/actividades', data);
        return response.data;
    },

    /**
     * Actualizar una actividad
     */
    update: async (id, data) => {
        const response = await api.put(`/actividades/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar una actividad
     */
    delete: async (id) => {
        const response = await api.delete(`/actividades/${id}`);
        return response.data;
    },

    /**
     * Subir múltiples fotos a una actividad
     */
    uploadPhotos: async (id, formData) => {
        const response = await api.post(`/actividades/${id}/photos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default actividadService;
