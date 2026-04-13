const db = require('./db');

async function migrate() {
    try {
        console.log('--- Iniciating CMS v2 Migration ---');

        // 1. Ensure web_secciones has metadata if not already there (it should be)
        // Already checked, it is longtext.

        // 2. Create index for performance on page queries
        await db.query('CREATE INDEX IF NOT EXISTS idx_pagina ON web_secciones(pagina)');

        // 3. Add column 'subtipo' to web_secciones if we want more granularity
        // Actually metadata is enough for now.

        // 4. Transform existing CTAs into sections for easier migration if needed
        // Or just keep them as they are and allow inserting them as blocks.

        // 5. Seed some initial blocks for other pages
        const pages = ['servicios', 'nosotros', 'contacto'];
        for (const page of pages) {
            const [rows] = await db.query('SELECT COUNT(*) as count FROM web_secciones WHERE pagina = ?', [page]);
            if (rows[0].count === 0) {
                await db.query(`
                    INSERT INTO web_secciones (pagina, tipo, orden, activo, metadata) VALUES 
                    (?, 'header_simple', 1, 1, '{"titulo": "Nuestra Historia", "subtitulo": "ArchiPlanner Heritage"}'),
                    (?, 'content_html', 2, 1, '{"html": "<p>Contenido inicial editable...</p>"}')
                `, [page, page]);
            }
        }

        console.log('✓ CMS v2 Migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

migrate();
