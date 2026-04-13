const pool = require('./db');

const checkDB = async () => {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        console.log('--- TABLAS ACTUALES ---');
        tables.forEach(t => console.log(Object.values(t)[0]));
        
        // Verificar columnas de cotizaciones
        const [cols] = await pool.query('DESCRIBE cotizaciones');
        console.log('--- COLUMNAS COTIZACIONES ---');
        cols.forEach(c => console.log(`${c.Field}: ${c.Type}`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
