import { UPLOADS_URL } from '../config';

/**
 * Normaliza una ruta de imagen para asegurar que tenga la URL base correcta.
 * Maneja casos de URLs externas, rutas que ya incluyen /uploads, y rutas relativas.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Limpiar slashes duplicados
  let cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Casuística especial: Si es una imagen de galería/hero pero no tiene el prefijo uploads
  if (
    (cleanPath.includes('hero-') || cleanPath.includes('gal-')) && 
    !cleanPath.includes('/uploads/')
  ) {
    cleanPath = `/uploads/gallery${cleanPath}`;
  }
  
  // Asegurar que UPLOADS_URL no termine en slash para concatenar limpiamente
  const baseUrl = UPLOADS_URL.endsWith('/') 
    ? UPLOADS_URL.slice(0, -1) 
    : UPLOADS_URL;

  return `${baseUrl}${cleanPath}`;
};
