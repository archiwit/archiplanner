const pool = require('./db');
const fs = require('fs');
const path = require('path');

const runMigrationV4 = async () => {
    try {
        const sqlPath = path.join(__dirname, '../migration_builder_v4.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const commands = sql.split(';').filter(cmd => cmd.trim() !== '');
        
        console.log(`🚀 Iniciando migración V4 (${commands.length} comandos)...`);
        
        for (const cmd of commands) {
            try {
                await pool.query(cmd);
                console.log(`✅ Comando ejecutado.`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`ℹ️ Ya existe, saltando...`);
                } else {
                    console.error(`❌ Error:`, err.message);
                }
            }
        }
        
        console.log('🏁 Migración V4 completada con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error general:', err);
        process.exit(1);
    }
};

runMigrationV4();
