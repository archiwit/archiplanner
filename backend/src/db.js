const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'u849872745_archiplanner',
    password: process.env.DB_PASSWORD || 'ArchiLuis.-48',
    database: process.env.DB_NAME || 'u849872745_archiplanner',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
    .then(async connection => {
        console.log('✅ MySQL Connected to archiplanner');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
    });

module.exports = pool;
