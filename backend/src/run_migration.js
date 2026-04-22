const db = require('./db');
const fs = require('fs');
const path = require('path');

async function executeSqlFile(filePath) {
    console.log(`Reading SQL from: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Improved splitting: match semicolons that are not inside quotes
    // For simplicity here, we'll split by ; and just clean up each query
    const queries = sql
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 5); // Avoid empty fragments or comments-only

    console.log(`Found ${queries.length} queries to execute.`);

    const connection = await db.getConnection();
    try {
        for (let i = 0; i < queries.length; i++) {
            console.log(`Executing query ${i + 1}/${queries.length}...`);
            // Remove leading comments from the query string itself for logging/execution
            const cleanQuery = queries[i].replace(/^(--.*[\r\n]*)+/, '').trim();
            if (cleanQuery) {
                await connection.query(cleanQuery);
            }
        }
    } finally {
        connection.release();
    }
}

async function runAllMigrations() {
    try {
        const migrations = [
            path.join(__dirname, 'migration_calendar.sql'),
            path.join(__dirname, 'migration_event_planning_v3.sql')
        ];

        for (const m of migrations) {
            console.log(`\n>>> Processing migration: ${path.basename(m)}`);
            await executeSqlFile(m);
        }

        console.log('\n✅ All migrations completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err);
        process.exit(1);
    }
}

runAllMigrations();
