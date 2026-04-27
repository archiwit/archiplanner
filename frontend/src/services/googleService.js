import api from './api';

const googleService = {
    /**
     * Get the Auth URL to connect Google Account
     */
    async getAuthUrl() {
        const response = await api.get('/google/auth-url');
        return response.data;
    },

    /**
     * Exchange code for tokens (saves to the logged in user)
     */
    async exchangeToken(code, userId) {
        const response = await api.post('/google/exchange-token', { code, userId });
        return response.data;
    },

    /**
     * Check if user is connected to Google
     */
    async checkStatus(userId) {
        const response = await api.get(`/google/status/${userId}`);
        return response.data;
    }
};

export default googleService;
