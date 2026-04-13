const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const db = require('./backend/src/db');

async function check() {
    try {
        const [rows] = await db.query('DESCRIBE web_historias');
        console.log('web_historias table structure:');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

check();
