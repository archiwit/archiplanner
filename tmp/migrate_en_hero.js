const db = require('./backend/src/db');

async function run() {
    try {
        console.log('Añadiendo columna en_hero a web_galeria_eventos...');
        await db.query('ALTER TABLE web_galeria_eventos ADD COLUMN IF NOT EXISTS en_hero TINYINT(1) DEFAULT 0');
        console.log('✓ Columna añadida/verificada con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
