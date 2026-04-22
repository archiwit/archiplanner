require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/src/db');
const fs = require('fs');
const path = require('path');

async function exportDB() {
    console.log('🚀 Iniciando exportación de base de datos...');
    const filename = 'archiplanner_prod_dump.sql';
    const filePath = path.join(__dirname, filename);
    let sql = `-- ArchiPlanner AG - Exportación para Hostinger\n-- Generado el: ${new Date().toLocaleString()}\n\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    try {
        const [tables] = await db.query('SHOW TABLES');
        const dbName = process.env.DB_NAME;

        for (const tableData of tables) {
            const tableName = Object.values(tableData)[0];
            console.log(`📦 Exportando tabla: ${tableName}...`);

            // Estructura
            const [createData] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
            sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            sql += createData[0]['Create Table'] + ';\n\n';

            // Datos
            const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
            if (rows.length > 0) {
                const columnNames = Object.keys(rows[0]).map(name => `\`${name}\``).join(', ');
                sql += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES \n`;
                
                const values = rows.map(row => {
                    const rowValues = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) {
                            return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        }
                        if (typeof val === 'object') {
                            // Escape single quotes for SQL insertion after JSON stringify
                            return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                        }
                        // Standard string escaping
                        return `'${val.toString().replace(/'/g, "''")}'`;
                    });
                    return `(${rowValues.join(', ')})`;
                });
                sql += values.join(',\n') + ';\n\n';
            }
        }

        sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';
        fs.writeFileSync(filePath, sql);
        console.log(`✅ ¡Éxito! Archivo generado en: ${filePath}`);
    } catch (err) {
        console.error('❌ Error en el export:', err);
    } finally {
        process.exit(0);
    }
}

exportDB();
