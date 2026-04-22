const db = require('./backend/src/db');
async function migrate() {
    try {
        await db.query(`ALTER TABLE usuarios MODIFY COLUMN rol ENUM('admin', 'coordinador', 'asesor', 'proveedor', 'cliente') DEFAULT 'admin'`);
        console.log('Role "cliente" added to usuarios table.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}
migrate();
