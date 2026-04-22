const db = require('../backend/src/db');

async function checkColumns() {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM event_puntos_clave');
        console.log('Columns in event_puntos_clave:', rows.map(r => r.Field));
        
        const required = ['tipo', 'icono', 'enlace'];
        for (const col of required) {
            if (!rows.find(r => r.Field === col)) {
                console.log(`❌ Column ${col} is MISSING!`);
                if (col === 'enlace') {
                    await db.query('ALTER TABLE event_puntos_clave ADD COLUMN enlace TEXT');
                } else {
                    await db.query(`ALTER TABLE event_puntos_clave ADD COLUMN ${col} VARCHAR(100)`);
                }
                console.log(`✅ Column ${col} added.`);
            } else {
                console.log(`✅ Column ${col} exists.`);
            }
        }

        // Also fix the actividades/activities typo if it still exists
        try {
             await db.query('ALTER TABLE actividades ADD COLUMN IF NOT EXISTS resumen TEXT AFTER descripcion');
             console.log('✅ Column resumen added/checked in actividades.');
        } catch (e) {
             console.warn('⚠️ Could not check actividades.resumen - probably renamed or already fixed.');
        }

    } catch (err) {
        console.error('Migration test failed:', err);
    } finally {
        process.exit();
    }
}

checkColumns();
