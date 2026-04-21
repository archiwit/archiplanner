// Configuración global de URLs
const isProd = import.meta.env.PROD;
const PORT = 5001;

export const API_BASE_URL = isProd 
    ? 'https://archiplanner-api.onrender.com/api' 
    : `http://127.0.0.1:${PORT}/api`;

export const UPLOADS_URL = isProd 
    ? 'https://archiplanner.com.co' 
    : 'http://127.0.0.1:5001';

/**
 * Intelligent helper to format upload paths, avoiding double /uploads
 * and ensuring correct concatenation.
 */
export const getUploadUrl = (path) => {
    if (!path || typeof path !== 'string') return '/placeholder.png';
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with /uploads/ if it doesn't already
    let cleanPath = path;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    
    if (!cleanPath.startsWith('uploads/')) {
        cleanPath = `uploads/${cleanPath}`;
    }
    
    return `${UPLOADS_URL}/${cleanPath}`;
};

export default {
    API_BASE_URL,
    UPLOADS_URL,
    getUploadUrl
};
