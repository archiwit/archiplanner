const db = require('./db');

async function fixDb() {
    console.log("🚀 Iniciando parche de base de datos V4...");
    try {
        // Añadir columnas SEO si no existen
        const columns = [
            'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL',
            'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT NULL',
            'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255) DEFAULT NULL',
            'ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS is_homepage TINYINT(1) DEFAULT 0'
        ];

        for (const sql of columns) {
            try {
                await db.query(sql);
                console.log(`✅ Ejecutado: ${sql.substring(0, 50)}...`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Columna ya existe, saltando.`);
                } else {
                    throw err;
                }
            }
        }

        console.log("🏁 Parche completado con éxito. Las páginas deberían ser visibles ahora.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error aplicando el parche:", err.message);
        process.exit(1);
    }
}

fixDb();
