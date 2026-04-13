const pool = require('./db');
pool.query('SELECT 1')
    .then(() => { console.log('DB OK'); process.exit(0); })
    .catch((err) => { console.error('DB FAIL:', err.message); process.exit(1); });
