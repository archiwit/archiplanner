const db = require('./src/db');
const fs = require('fs');
const path = require('path');

async function executeSqlFile(filePath) {
    console.log(`Reading SQL from: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    const queries = sql
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 5);

    console.log(`Found ${queries.length} queries to execute.`);

    const connection = await db.getConnection();
    try {
        for (let i = 0; i < queries.length; i++) {
            console.log(`Executing query ${i + 1}/${queries.length}...`);
            const cleanQuery = queries[i].replace(/^(--.*[\r\n]*)+/, '').trim();
            if (cleanQuery) {
                await connection.query(cleanQuery);
            }
        }
    } finally {
        connection.release();
    }
}

async function run() {
    try {
        const migrationPath = path.join(__dirname, 'migration_v5_gastos_permisos.sql');
        await executeSqlFile(migrationPath);
        console.log('✅ Migration success!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

run();
