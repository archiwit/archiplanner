const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BRIDGE_URL = 'https://archiplanner.com.co/upload_bridge.php';
const BRIDGE_TOKEN = 'archi_bridge_2024_secure_99';

/**
 * Sube un archivo local al puente de Hostinger
 * @param {string} localPath Ruta completa del archivo en el servidor local (Render)
 * @param {string} remoteFolder Carpeta de destino (ej: 'config', 'items')
 * @returns {Promise<Object>} Resultado de la subida
 */
const uploadToRemote = async (localPath, remoteFolder) => {
    try {
        if (!fs.existsSync(localPath)) {
            throw new Error(`El archivo local no existe: ${localPath}`);
        }

        const form = new FormData();
        form.append('token', BRIDGE_TOKEN);
        form.append('folder', remoteFolder);
        form.append('file', fs.createReadStream(localPath));

        const response = await axios.post(BRIDGE_URL, form, {
            headers: {
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data && response.data.success) {
            console.log(`[RemoteStorage] Archivo subido exitosamente: ${response.data.path}`);
            // Una vez subido exitosamente a Hostinger, lo borramos de Render
            try {
                fs.unlinkSync(localPath);
                console.log(`[RemoteStorage] Archivo local eliminado: ${localPath}`);
            } catch (err) {
                console.error(`[RemoteStorage] Error al borrar archivo local:`, err);
            }
            return response.data;
        } else {
            throw new Error(response.data.error || 'Error desconocido en el puente');
        }
    } catch (error) {
        console.error('[RemoteStorage] Error en la subida remota:', error.message);
        // Si falla la subida remota, el archivo se queda en Render como fallback temporal
        return { success: false, error: error.message };
    }
};

module.exports = { uploadToRemote };
