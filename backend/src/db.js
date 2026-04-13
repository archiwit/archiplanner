const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(async connection => {
        console.log('✅ MySQL Connected to archiplanner');
        
        // Auto-migration: Ensure V4 columns exist
        try {
            console.log('🚀 Checking V4 DB Schema...');
            const columns = [
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT NULL',
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255) DEFAULT NULL',
                'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS is_homepage TINYINT(1) DEFAULT 0'
            ];
            for (const sql of columns) {
                await connection.query(sql);
            }
            console.log('✅ V4 DB Schema verified');
        } catch (schemaErr) {
            console.warn('⚠️ Auto-migration notice:', schemaErr.message);
        }

        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
    });

module.exports = pool;
