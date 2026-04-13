const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'archiplanner'
    });

    try {
        console.log('--- Iniciando Migración de Galería v3 (Metadata) ---');

        // Agregar columna metadata if not exists
        await connection.query(`
            ALTER TABLE web_galeria_eventos 
            ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT NULL
        `);
        console.log('✓ Columna metadata agregada a web_galeria_eventos.');

        console.log('--- Migración completada ---');
    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        await connection.end();
    }
}

migrate();
