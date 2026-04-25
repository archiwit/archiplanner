const db = require('./src/db');
async function run() {
    try {
        const [rows] = await db.query('DESCRIBE cotizaciones');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
