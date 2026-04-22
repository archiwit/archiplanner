// Configuración global de URLs
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const PORT = 5001;

export const API_BASE_URL = isLocal 
    ? `http://127.0.0.1:${PORT}/api`
    : 'https://archiplanner-api.onrender.com/api';

export const UPLOADS_URL = isLocal 
    ? `http://127.0.0.1:${PORT}`
    : 'https://archiplanner.com.co';

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
