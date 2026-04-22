const db = require('./src/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT id, clase, tipo_evento, num_arriendo FROM cotizaciones ORDER BY id DESC LIMIT 10');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
