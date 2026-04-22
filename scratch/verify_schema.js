const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function verify() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    try {
        const [rows] = await conn.query('SHOW CREATE TABLE event_puntos_clave');
        console.log('TABLE DESIGN:');
        console.log(rows[0]['Create Table']);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await conn.end();
    }
}
verify();
