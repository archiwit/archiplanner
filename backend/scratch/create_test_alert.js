const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function createTestAlert() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'archiplanner'
    });

    try {
        const [result] = await connection.execute(
            'INSERT INTO alertas (titulo, mensaje, tipo, leida, fecha_creacion) VALUES (?, ?, ?, ?, NOW())',
            [
                '¡Interfaz Optimizada!',
                'Has activado el nuevo diseño del Sidebar. Ahora tienes más espacio vertical en tus herramientas.',
                'recordatorio',
                0
            ]
        );
        console.log('Alerta de prueba creada con ID:', result.insertId);
    } catch (err) {
        console.error('Error creando alerta:', err.message);
    } finally {
        await connection.end();
    }
}

createTestAlert();
