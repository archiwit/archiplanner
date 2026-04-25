const db = require('./src/db');
async function run() {
    try {
        const [rows] = await db.query('SHOW CREATE TABLE cotizaciones');
        console.log(rows[0]['Create Table']);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
