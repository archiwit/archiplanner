const db = require('./db');

async function seed() {
    try {
        console.log('--- Agregando Hero Moderno a la Portada ---');

        // 1. Desplazar órdenes existentes en 'home'
        await db.query('UPDATE web_secciones SET orden = orden + 1 WHERE pagina = "home"');

        // 2. Insertar el nuevo Hero Moderno como primer bloque
        const metadata = {
            titulo: "Creamos Experiencias Eternas",
            subtitulo: "Diseño editorial y curaduría de eventos para almas sofisticadas",
            media_type: "image",
            media_path: "/uploads/gallery/1775751276630_portada.jpg" // Usando una imagen que probablemente existe o placeholder
        };

        await db.query(`
            INSERT INTO web_secciones (pagina, tipo, orden, activo, metadata) 
            VALUES ('home', 'hero_modern', 1, 1, ?)
        `, [JSON.stringify(metadata)]);

        console.log('✓ Hero Moderno insertado con éxito en la base de datos.');
        process.exit(0);
    } catch (err) {
        console.error('Error al insertar el bloque:', err);
        process.exit(1);
    }
}

seed();
