const db = require('./db');

async function migrate() {
    try {
        console.log('--- Iniciando migración Web CMS ---');

        // 1. Crear tabla testimonios
        await db.query(`
            CREATE TABLE IF NOT EXISTS testimonios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image VARCHAR(255),
                message TEXT,
                name VARCHAR(100),
                event_title VARCHAR(100),
                es_visible TINYINT(1) DEFAULT 1,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Tabla testimonios lista.');

        // 2. Crear tabla web_contenido
        await db.query(`
            CREATE TABLE IF NOT EXISTS web_contenido (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pagina VARCHAR(50),
                seccion VARCHAR(50),
                clave VARCHAR(50),
                valor TEXT,
                UNIQUE KEY unique_content (pagina, seccion, clave)
            )
        `);
        console.log('✓ Tabla web_contenido lista.');

        // 3. Seed Testimonios (solo si está vacía)
        const [testRows] = await db.query('SELECT COUNT(*) as count FROM testimonios');
        if (testRows[0].count === 0) {
            await db.query(`
                INSERT INTO testimonios (image, message, name, event_title) VALUES
                ('/images/testimonials/testimonio-1.jpg', 'Cada detalle se sintió íntimo, refinado y perfectamente pensado. ArchiPlanner logró convertir nuestra historia en una experiencia visual inolvidable.', 'Valentina & Andrés', 'Boda editorial'),
                ('/images/testimonials/testimonio-2.jpg', 'La estética, la calma del proceso y la sensibilidad del equipo hicieron que todo se sintiera elegante y natural desde el primer momento.', 'Laura Gómez', 'Celebración de XV'),
                ('/images/testimonials/testimonio-3.jpg', 'No solo diseñaron un evento hermoso; diseñaron una emoción. Todo tuvo armonía, intención y muchísima delicadeza.', 'Mariana & Felipe', 'Wedding design'),
                ('/images/testimonials/testimonio-4.jpg', 'Sentimos acompañamiento real, buen gusto y una ejecución impecable. Fue una experiencia tan bella como tranquila.', 'Sofía R.', 'Evento social')
            `);
            console.log('✓ Datos iniciales de testimonios inyectados.');
        }

        // 4. Seed Web Content (UPSERT)
        const content = [
            ['home', 'hero', 'titulo', 'Celebraciones que <br /><span>Permanecen</span>'],
            ['home', 'hero', 'descripcion', 'Especialistas en la planificación integral de hitos inolvidables con un toque de distinción y diseño editorial.'],
            ['home', 'metodo', 'tag', 'El Método ArchiPlanner'],
            ['home', 'metodo', 'titulo', 'De la Idea a la Celebración'],
            ['home', 'footer', 'cierre', 'Vivimos el pulse de cada evento...'],
            ['contacto', 'info', 'titulo', 'Contacto'],
            ['contacto', 'info', 'descripcion', 'Estamos listos para hacer realidad tu evento emocionante.']
        ];

        for (const [pag, sec, cla, val] of content) {
            await db.query(`
                INSERT INTO web_contenido (pagina, seccion, clave, valor) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE valor = VALUES(valor)
            `, [pag, sec, cla, val]);
        }
        console.log('✓ Textos dinámicos iniciales inyectados.');

        console.log('--- Migración completada con éxito ---');
        process.exit(0);
    } catch (err) {
        console.error('Error en la migración:', err);
        process.exit(1);
    }
}

migrate();
