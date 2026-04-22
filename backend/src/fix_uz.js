const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Corrigiendo usuario LuzM...');
        const [res] = await connection.query(
            "UPDATE usuarios SET nombre = ?, rol = ? WHERE id = ? OR nick = ?", 
            ['Luz Marina', 'asesor_arriendos', 9, 'LuzM']
        );
        console.log('Resultado:', res.affectedRows, 'filas actualizadas');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

fixUser();
