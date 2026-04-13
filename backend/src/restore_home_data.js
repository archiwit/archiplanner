const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function restore() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'archiplanner'
    });

    try {
        console.log('--- Restaurando Secciones Originales del Home ---');

        // Limpiar secciones actuales del home para evitar duplicados en la restauración
        await connection.query('DELETE FROM web_secciones WHERE pagina = "home"');

        const homeSections = [
            {
                pagina: 'home',
                tipo: 'hero',
                orden: 1,
                metadata: JSON.stringify({
                    titulo: 'Curaduría de <span class="text-primary">Experiencias</span> Inolvidables',
                    tag: 'Wedding & Event Planner',
                    subtitulo: 'Diseñamos celebraciones de alto nivel con una estética editorial y sofisticada.',
                    estilos: { paddingTop: '0px', paddingBottom: '0px', bgColor: '#000000' }
                })
            },
            {
                pagina: 'home',
                tipo: 'stories',
                orden: 2,
                metadata: JSON.stringify({
                    titulo: 'Nuestras Historias',
                    estilos: { paddingTop: '80px', paddingBottom: '80px', bgColor: '#080808' }
                })
            },
            {
                pagina: 'home',
                tipo: 'servicios',
                orden: 3,
                metadata: JSON.stringify({
                    titulo: 'Nuestros Servicios',
                    estilos: { paddingTop: '100px', paddingBottom: '100px' }
                })
            },
            {
                pagina: 'home',
                tipo: 'valores',
                orden: 4,
                metadata: JSON.stringify({
                    titulo: 'Nuestros Valores',
                    estilos: { paddingTop: '80px', paddingBottom: '80px' }
                })
            },
            {
                pagina: 'home',
                tipo: 'pulse',
                orden: 5,
                metadata: JSON.stringify({
                    titulo: 'El Pulso ArchiPlanner',
                    estilos: { paddingTop: '120px', paddingBottom: '120px' }
                })
            },
            {
                pagina: 'home',
                tipo: 'cta',
                orden: 6,
                metadata: JSON.stringify({
                    cta_slug: 'bento_cta_main',
                    estilos: { paddingTop: '80px', paddingBottom: '120px' }
                })
            }
        ];

        for (const section of homeSections) {
            await connection.query(
                'INSERT INTO web_secciones (pagina, tipo, orden, activo, metadata) VALUES (?, ?, ?, 1, ?)',
                [section.pagina, section.tipo, section.orden, section.metadata]
            );
        }

        console.log('✓ Secciones del Home restauradas correctamente.');
        console.log('--- Proceso completado ---');
    } catch (error) {
        console.error('Error en la restauración:', error);
    } finally {
        await connection.end();
    }
}

restore();
