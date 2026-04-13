const db = require('./db');

async function migrate() {
    try {
        console.log('--- Iniciando migración de Servicios ---');

        await db.query(`
            CREATE TABLE IF NOT EXISTS servicios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(100) NOT NULL,
                tag VARCHAR(50),
                descripcion TEXT,
                imagen VARCHAR(255),
                link VARCHAR(255) DEFAULT '/contacto',
                visible TINYINT(1) DEFAULT 1,
                orden INT DEFAULT 0,
                seccion VARCHAR(50) DEFAULT 'principales', -- 'principales' o 'sociales'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Tabla servicios lista.');

        // Seed data based on existing Home content
        const [rows] = await db.query('SELECT COUNT(*) as count FROM servicios');
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO servicios (titulo, tag, descripcion, imagen, orden, seccion) VALUES
                ('Bodas de Ensueño', 'Planificación', 'Planificación integral con un enfoque romántico y arquitectónico.', '/images/home/bodas.png', 1, 'principales'),
                ('XV Años Espectaculares', 'Celebración', 'Celebramos tu esencia con estilo, tendencia y sofisticación.', '/images/home/quince.png', 2, 'principales'),
                ('Eventos Corporativos', 'Estrategia', 'Galas, lanzamientos y encuentros de alto impacto para tu marca.', '/images/home/corporativos.png', 3, 'principales'),
                
                ('Baby Shower', 'Dulces esperas', 'Dulces esperas con decoraciones temáticas y organización cálida.', NULL, 4, 'sociales'),
                ('Revelación de Sexo', 'Momentos mágicos', 'Momentos de máxima emoción con puestas en escena creativas.', NULL, 5, 'sociales'),
                ('Aniversarios', 'Renovando promesas', 'Renovando promesas con celebraciones llenas de nostalgia y elegancia.', NULL, 6, 'sociales'),
                ('Cenas Privadas', 'Encuentros gastronómicos', 'Encuentros gastronómicos exclusivos con curaduría de mesa editorial.', NULL, 7, 'sociales'),
                ('Encuentros Deportivos', 'Logística premium', 'Organización de torneos y jornadas activas con logística premium.', NULL, 8, 'sociales'),
                ('Pedidas de Noviazgo', 'Historias de amor', 'Creamos el ambiente ideal para el inicio de una historia especial.', NULL, 9, 'sociales')
            `);
            console.log('✓ Datos iniciales de servicios inyectados.');
        }

        console.log('--- Migración de Servicios completada ---');
        process.exit(0);
    } catch (err) {
        console.error('Error en la migración de servicios:', err);
        process.exit(1);
    }
}

migrate();
