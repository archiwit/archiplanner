const db = require('../src/db');
async function migrate() {
    try {
        console.log('--- Iniciando Migración Navigation & Footer ---');
        
        // Add nav_config
        await db.query(`ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS nav_config LONGTEXT NULL`);
        console.log('✓ Columna nav_config añadida');
        
        // Add footer_config
        await db.query(`ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS footer_config LONGTEXT NULL`);
        console.log('✓ Columna footer_config añadida');
        
        console.log('--- Migración Completada ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}
migrate();
