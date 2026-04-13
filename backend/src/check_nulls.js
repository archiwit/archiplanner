const pool = require('./db');

const checkNulls = async () => {
    try {
        console.log('--- CHECKING NULLS IN ARTICULOS ---');
        const [artRows] = await pool.query('SELECT id, nombre, categoria FROM articulos WHERE nombre IS NULL OR categoria IS NULL');
        console.log(`Found ${artRows.length} articles with null nombre or categoria`);
        artRows.forEach(r => console.log(r));

        console.log('\n--- CHECKING NULLS IN LOCACIONES ---');
        const [locRows] = await pool.query('SELECT id, nombre, tipo FROM locaciones WHERE nombre IS NULL OR tipo IS NULL');
        console.log(`Found ${locRows.length} locations with null nombre or tipo`);
        locRows.forEach(r => console.log(r));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkNulls();
