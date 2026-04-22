import { getUploadUrl } from '../config';

/**
 * Normaliza una ruta de imagen para asegurar que tenga la URL base correcta.
 * Maneja casos de URLs externas, rutas que ya incluyen /uploads, y rutas relativas.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Normalizar: quitar slash inicial si existe para comparar
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return getUploadUrl(path);
};
