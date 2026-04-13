// Configuración global de URLs
const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd 
    ? 'https://archiplanner.com.co/api' 
    : 'http://localhost:5000/api';

export const UPLOADS_URL = isProd 
    ? 'https://archiplanner.com.co' 
    : 'http://localhost:5000';

export default {
    API_BASE_URL,
    UPLOADS_URL
};
