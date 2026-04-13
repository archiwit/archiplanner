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
        console.log('--- Iniciando Migración de Galería v2 ---');

        // 1. Tabla de Categorías
        await connection.query(`
            CREATE TABLE IF NOT EXISTS web_galeria_categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE
            )
        `);
        console.log('✓ Tabla web_galeria_categorias lista.');

        // 2. Tabla de Eventos
        await connection.query(`
            CREATE TABLE IF NOT EXISTS web_galeria_eventos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                descripcion TEXT,
                categoria_id INT,
                portada_url VARCHAR(255),
                orden INT DEFAULT 0,
                activo TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES web_galeria_categorias(id) ON DELETE SET NULL
            )
        `);
        console.log('✓ Tabla web_galeria_eventos lista.');

        // 3. Tabla de Media del Evento
        await connection.query(`
            CREATE TABLE IF NOT EXISTS web_galeria_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                evento_id INT NOT NULL,
                url VARCHAR(255),
                tipo ENUM('image', 'video', 'embed') NOT NULL,
                external_url VARCHAR(500),
                orden INT DEFAULT 0,
                FOREIGN KEY (evento_id) REFERENCES web_galeria_eventos(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Tabla web_galeria_media lista.');

        // Insertar categorías iniciales
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM web_galeria_categorias');
        if (categories[0].count === 0) {
            await connection.query(`
                INSERT INTO web_galeria_categorias (nombre, slug) VALUES 
                ('Bodas', 'bodas'),
                ('XV Años', 'xv'),
                ('Sociales', 'social'),
                ('Corporativos', 'corp')
            `);
            console.log('✓ Categorías iniciales insertadas.');
        }

        console.log('--- Migración completada con éxito ---');
    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        await connection.end();
    }
}

migrate();
