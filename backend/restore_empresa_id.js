const db = require('./src/db');
async function run() {
    try {
        console.log('Restaurando columna empresa_id en tabla cotizaciones...');
        // Verificamos si existe antes de agregarla
        const [columns] = await db.query('SHOW COLUMNS FROM cotizaciones LIKE "empresa_id"');
        if (columns.length === 0) {
            await db.query(`ALTER TABLE cotizaciones ADD COLUMN empresa_id INT NULL AFTER notas_devolucion`);
            console.log('Columna empresa_id agregada.');
            
            // Agregar FK si no existe
            try {
                await db.query(`ALTER TABLE cotizaciones ADD CONSTRAINT fk_coti_empresa FOREIGN KEY (empresa_id) REFERENCES configuracion(id) ON DELETE SET NULL`);
                console.log('Restricción FK fk_coti_empresa agregada.');
            } catch (fkErr) {
                console.log('Nota: No se pudo agregar la FK (posiblemente ya existe o hay datos inconsistentes):', fkErr.message);
            }
        } else {
            console.log('La columna empresa_id ya existe.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error en la migración:', err.message);
        process.exit(1);
    }
}
run();
