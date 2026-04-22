const db = require('./backend/src/db');
require('dotenv').config({ path: './backend/.env' });

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE event_puntos_clave');
        console.log('Columns in event_puntos_clave:');
        rows.forEach(r => console.log(`- ${r.Field}: ${r.Type}`));
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
