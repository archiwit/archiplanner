const db = require('./src/db');

async function debugLoginDetails() {
    try {
        console.log('--- BUSCANDO USUARIOS QUE COINCIDAN CON "Leidy" ---');
        const [users] = await db.query('SELECT id, nick, correo, rol, clave FROM usuarios WHERE nick LIKE ? OR correo LIKE ?', ['%Leidy%', '%Leidy%']);
        
        if (users.length === 0) {
            console.log('No se encontró ningún usuario con ese nombre o nick.');
        } else {
            console.log('Usuarios encontrados:');
            users.forEach(u => {
                console.log(`- ID: ${u.id} | Nick: "${u.nick}" | Correo: "${u.correo}" | Rol: ${u.rol} | Clave: "${u.clave}"`);
            });
        }

        console.log('\n--- BUSCANDO EN TABLA CLIENTES ---');
        const [clients] = await db.query('SELECT id, nick, correo, u_id FROM clientes WHERE nick LIKE ? OR correo LIKE ?', ['%Leidy%', '%Leidy%']);
        console.log('Clientes encontrados:', clients);

    } catch (err) {
        console.error('Error en diagnóstico:', err.message);
    } finally {
        process.exit();
    }
}

debugLoginDetails();
