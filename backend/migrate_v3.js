const db = require('./src/db');

async function run() {
    console.log('🚀 Starting DB Sync for Layouts...');
    
    const queries = [
        "ALTER TABLE event_layouts CHANGE COLUMN dimensiones_x ancho_metros FLOAT DEFAULT 0",
        "ALTER TABLE event_layouts CHANGE COLUMN dimensiones_y largo_metros FLOAT DEFAULT 0",
        "ALTER TABLE event_layouts ADD COLUMN escala_px_metro INT DEFAULT 50",
        "ALTER TABLE event_layouts ADD COLUMN is_metric TINYINT(1) DEFAULT 0"
    ];

    for (const q of queries) {
        try {
            await db.query(q);
            console.log(`✅ Success: ${q}`);
        } catch (err) {
            console.log(`⚠️ Notice: ${err.message}`);
        }
    }
    
    console.log('🏁 DB Sync Finished');
    process.exit(0);
}

run();
