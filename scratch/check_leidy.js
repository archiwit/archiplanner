const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Checking for user "LeidyK"...');
        const [rows] = await connection.execute('SELECT * FROM usuarios WHERE nick = ? OR correo = ?', ['LeidyK', 'LeidyK']);
        
        if (rows.length === 0) {
            console.log('USER NOT FOUND');
        } else {
            console.log('User found:', {
                id: rows[0].id,
                nick: rows[0].nick,
                correo: rows[0].correo,
                rol: rows[0].rol,
                clave_length: rows[0].clave ? rows[0].clave.length : 0
            });
        }
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await connection.end();
    }
}

checkUser();
