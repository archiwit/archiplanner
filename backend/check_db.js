const db = require('./src/db');

async function checkDB() {
    try {
        console.log('Checking event_itinerarios table structure...');
        const [columns] = await db.query('DESCRIBE event_itinerarios');
        console.log('Columns:', JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

checkDB();
