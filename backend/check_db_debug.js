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
        console.log('--- SEARCHING IN "usuarios" TABLE ---');
        const [users] = await connection.execute('SELECT id, nombre, nick, correo, rol, clave FROM usuarios WHERE nick LIKE "%Leidy%" OR correo LIKE "%Leidy%"');
        console.log('Results in usuarios:', users);

        console.log('\n--- SEARCHING IN "clientes" TABLE ---');
        const [clients] = await connection.execute('SELECT id, nombre, nick, correo, u_id, clave FROM clientes WHERE nick LIKE "%Leidy%" OR correo LIKE "%Leidy%"');
        console.log('Results in clientes:', clients);

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await connection.end();
    }
}

checkUser();
