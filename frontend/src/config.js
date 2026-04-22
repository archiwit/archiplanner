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
    
    // 1. Limpiar barras iniciales y duplicadas
    let cleanPath = path.replace(/^\/+/, '');
    
    // 2. Si ya incluye 'uploads/', no lo volvemos a poner
    if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.substring(8); // 'uploads/'.length = 8
    }
    
    // 3. Unir con la URL base asegurando que la ruta final use uploads/
    const baseUrl = UPLOADS_URL.endsWith('/') ? UPLOADS_URL.slice(0, -1) : UPLOADS_URL;
    return `${baseUrl}/uploads/${cleanPath}`;
};

export default {
    API_BASE_URL,
    UPLOADS_URL,
    getUploadUrl
};
