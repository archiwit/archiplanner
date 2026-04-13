const pool = require('./db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../migration_payments.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Separar comandos SQL (por ;) y filtrar vacíos
        const commands = sql.split(';').filter(cmd => cmd.trim() !== '');
        
        console.log(`🚀 Iniciando migración de pagos (${commands.length} comandos)...`);
        
        for (const cmd of commands) {
            try {
                await pool.query(cmd);
                console.log(`✅ Comando ejecutado: ${cmd.substring(0, 50)}...`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ La columna ya existe, saltando...`);
                } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`ℹ️ La tabla ya existe, saltando...`);
                } else {
                    console.error(`❌ Error en comando: ${cmd.substring(0, 50)}...`, err.message);
                }
            }
        }
        
        console.log('🏁 Migración de pagos completada con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error general en migración:', err);
        process.exit(1);
    }
};

runMigration();
