const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fix() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'archiplanner'
    });

    try {
        console.log('--- Iniciando reparación de rutas de galería ---');
        
        // 1. Obtener todos los eventos
        const [eventos] = await connection.query('SELECT id, titulo, portada_url FROM web_galeria_eventos');
        
        for (const evento of eventos) {
            // Si la portada es nula o el string "null"
            if (!evento.portada_url || evento.portada_url === 'null' || evento.portada_url === '') {
                console.log(`Evento [${evento.id}] "${evento.titulo}" no tiene portada. Buscando en media...`);
                
                // Buscar la primera imagen en la tabla media
                const [media] = await connection.query(
                    'SELECT url FROM web_galeria_media WHERE evento_id = ? AND tipo = "image" ORDER BY id ASC LIMIT 1',
                    [evento.id]
                );
                
                if (media.length > 0) {
                    const newPath = media[0].url;
                    console.log(`-> Asignando portada: ${newPath}`);
                    await connection.query(
                        'UPDATE web_galeria_eventos SET portada_url = ? WHERE id = ?',
                        [newPath, evento.id]
                    );
                } else {
                    console.log(`-> No se encontró media para este evento.`);
                }
            }
        }

        console.log('--- Proceso completado ---');
    } catch (err) {
        console.error('Error durante la reparación:', err);
    } finally {
        await connection.end();
    }
}

fix();
