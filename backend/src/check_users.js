const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- USUARIOS ---');
        const [users] = await pool.query("SELECT id, nombre, nick, rol FROM usuarios WHERE nick = 'LuzM'");
        console.log(users);

        console.log('--- CLIENTES ---');
        const [clients] = await pool.query("SELECT id, nombre, nick FROM clientes WHERE nick = 'LuzM'");
        console.log(clients);

        if (users.length > 0 && clients.length > 0) {
            console.log('CONFLICT: User exists in both tables.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkUsers();
