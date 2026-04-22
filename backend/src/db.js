const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(async connection => {
        console.log('✅ MySQL Connected to archiplanner');
        
        // Auto-migration: Ensure V4 columns exist
        try {
            console.log('🚀 Checking V4 DB Schema...');
            const columns = [
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT NULL',
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS is_homepage TINYINT(1) DEFAULT 0',
                'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(100) DEFAULT NULL',
                'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10) DEFAULT NULL',
                'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(50) DEFAULT NULL',
                'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nacimiento DATE DEFAULT NULL',
                'ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS contrato_path VARCHAR(255) DEFAULT NULL',
                `CREATE TABLE IF NOT EXISTS event_itinerarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cot_id INT NOT NULL,
                    parent_id INT DEFAULT NULL,
                    titulo VARCHAR(255) NOT NULL,
                    responsable VARCHAR(150),
                    descripcion TEXT,
                    icono VARCHAR(100) DEFAULT 'Clock',
                    foto_path VARCHAR(255) DEFAULT NULL,
                    hora TIME,
                    orden INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
                `CREATE TABLE IF NOT EXISTS event_inspiraciones (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cot_id INT NOT NULL,
                    foto_path VARCHAR(255) NOT NULL,
                    titulo VARCHAR(255),
                    categoria VARCHAR(100) DEFAULT 'General',
                    zona VARCHAR(100) DEFAULT 'General',
                    descripcion TEXT,
                    subido_por ENUM('admin', 'cliente') DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
                `CREATE TABLE IF NOT EXISTS event_puntos_clave (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cot_id INT NOT NULL,
                    categoria VARCHAR(100) DEFAULT 'Protocolo',
                    titulo VARCHAR(255) NOT NULL,
                    valor TEXT,
                    nota TEXT,
                    completado BOOLEAN DEFAULT FALSE,
                    orden INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
                
                // Definitive fixes for tables already created with cli_id
                // Note: We drop foreign keys first to allow column removal
                'ALTER TABLE event_itinerarios DROP FOREIGN KEY IF EXISTS event_itinerarios_ibfk_1',
                'ALTER TABLE event_itinerarios MODIFY COLUMN cot_id INT NOT NULL',
                'ALTER TABLE event_itinerarios DROP COLUMN IF EXISTS cli_id',
                'ALTER TABLE event_itinerarios DROP INDEX IF EXISTS idx_itinerario_cli',

                'ALTER TABLE event_inspiraciones DROP FOREIGN KEY IF EXISTS event_inspiraciones_ibfk_1',
                'ALTER TABLE event_inspiraciones MODIFY COLUMN cot_id INT NOT NULL',
                'ALTER TABLE event_inspiraciones DROP COLUMN IF EXISTS cli_id',
                'ALTER TABLE event_inspiraciones DROP INDEX IF EXISTS idx_inspiracion_cli',

                'ALTER TABLE event_puntos_clave DROP FOREIGN KEY IF EXISTS event_puntos_clave_ibfk_1',
                'ALTER TABLE event_puntos_clave MODIFY COLUMN cot_id INT NOT NULL',
                'ALTER TABLE event_puntos_clave DROP COLUMN IF EXISTS cli_id',
                'ALTER TABLE event_puntos_clave DROP INDEX IF EXISTS idx_puntos_cli',
                
                `CREATE TABLE IF NOT EXISTS actividad_fotos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    act_id INT NOT NULL,
                    foto_path VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (act_id) REFERENCES actividades(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
                'ALTER TABLE actividades ADD COLUMN IF NOT EXISTS resumen TEXT AFTER descripcion',
                'ALTER TABLE actividades ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE',
                'ALTER TABLE event_puntos_clave ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT "Texto"',
                'ALTER TABLE event_puntos_clave ADD COLUMN IF NOT EXISTS icono VARCHAR(100) DEFAULT "Star"',
                'ALTER TABLE event_puntos_clave ADD COLUMN IF NOT EXISTS enlace TEXT',
                'ALTER TABLE event_itinerarios ADD COLUMN IF NOT EXISTS punto_clave_id INT DEFAULT NULL',
                'ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS clase ENUM("evento", "arriendo") DEFAULT "evento"',
                'ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS num_arriendo VARCHAR(20) DEFAULT NULL',
                'ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS notas_entrega TEXT',
                'ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS notas_devolucion TEXT',
                // Backfill icons based on common titles to avoid generic "Info" icon
                'UPDATE event_puntos_clave SET icono = "Music" WHERE (titulo LIKE "%Baila%" OR titulo LIKE "%Entrada%" OR titulo LIKE "%Salida%") AND icono IS NULL',
                'UPDATE event_puntos_clave SET icono = "Users" WHERE (titulo LIKE "%Padrino%" OR titulo LIKE "%Invitado%" OR titulo LIKE "%Anfitrión%") AND icono IS NULL',
                'UPDATE event_puntos_clave SET icono = "Heart" WHERE titulo LIKE "%Voto%" AND icono IS NULL',
                'UPDATE event_puntos_clave SET icono = "Utensils" WHERE titulo LIKE "%Menú%" AND icono IS NULL',
                // Branding V4.6
                'ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS logo_black_path VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS pi_url VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS pi_svg TEXT DEFAULT NULL'
            ];
            for (const sql of columns) {
                try {
                    await connection.query(sql);
                } catch (colErr) {
                    // Ignore if column already exists or other minor issues
                    if (!colErr.message.includes('Duplicate column')) {
                        console.warn(`⚠️ Query failed but continuing: ${sql.slice(0, 50)}... - ${colErr.message}`);
                    }
                }
            }

            // Sync email if null (initial migration)
            await connection.query('UPDATE usuarios SET email = CONCAT(nick, "@archiplanner.com") WHERE email IS NULL');

            console.log('✅ V4 DB Schema verified and sync done');
        } catch (schemaErr) {
            console.warn('⚠️ Auto-migration notice:', schemaErr.message);
        }

        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
    });

module.exports = pool;
