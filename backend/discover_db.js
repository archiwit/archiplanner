const db = require('./src/db');

async function findRealDB() {
    try {
        console.log('--- Database Discovery Diagnostic ---');
        const [dbs] = await db.query('SHOW DATABASES');
        
        for (let d of dbs) {
            const name = d.Database;
            if (['mysql', 'information_schema', 'performance_schema', 'sys', 'phpmyadmin'].includes(name)) continue;
            
            try {
                await db.query('USE ' + name);
                const [tables] = await db.query("SHOW TABLES LIKE 'cotizaciones'");
                if (tables.length > 0) {
                    const [rows] = await db.query('SELECT COUNT(*) as count FROM cotizaciones');
                    console.log(`FOUND: Database "${name}" has ${rows[0].count} records in cotizaciones.`);
                    
                    if (rows[0].count > 100) {
                        console.log(`>>> This is likely the TARGET database. <<<`);
                        const [cols] = await db.query('DESCRIBE cotizaciones');
                        const hasClase = cols.some(c => c.Field === 'clase');
                        console.log(`Schema check: "clase" column exists? ${hasClase ? 'YES' : 'NO'}`);
                    }
                }
            } catch (e) {
                // Ignore errors for DBs we can't access
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Fatal diagnostic error:', err);
        process.exit(1);
    }
}

findRealDB();
