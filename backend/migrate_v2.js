const db = require('./src/db');

const sql = `
CREATE TABLE IF NOT EXISTS event_invitados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cot_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    celular VARCHAR(50),
    grupo VARCHAR(100),
    categoria VARCHAR(100),
    adultos INT DEFAULT 1,
    niños INT DEFAULT 0,
    estado ENUM('creado', 'confirmado', 'cancelado', 'pendiente') DEFAULT 'creado',
    mesa_id VARCHAR(50),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_layouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cot_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    dimensiones_x FLOAT DEFAULT 0,
    dimensiones_y FLOAT DEFAULT 0,
    fondo_url VARCHAR(255),
    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_layout_elementos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layout_id INT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    rotacion FLOAT DEFAULT 0,
    puestos INT DEFAULT 0,
    label VARCHAR(255),
    config_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const queries = sql.split(';').filter(q => q.trim().length > 0);

async function run() {
    console.log('🚀 Starting ArchiPlanner 360 Migration...');
    for (const q of queries) {
        try {
            await db.query(q);
            console.log('✅ Executed query successfully');
        } catch (err) {
            console.error('❌ Error executing query:', err.message);
        }
    }
    console.log('🏁 Migration finished');
    process.exit(0);
}

run();
