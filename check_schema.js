const db = require('./backend/src/db');

async function checkSchema() {
    try {
        const [columns] = await db.query('SHOW COLUMNS FROM cotizacion_detalles');
        console.log('--- COLUMNS IN cotizacion_detalles ---');
        console.table(columns);
        process.exit(0);
    } catch (err) {
        console.error('Error fetching schema:', err);
        process.exit(1);
    }
}

checkSchema();
