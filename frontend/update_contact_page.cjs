const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function update() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'archiplanner_db'
    });

    try {
        const [pages] = await conn.execute('SELECT id FROM paginas_v4 WHERE slug = "contacto"');
        if (pages.length > 0) {
            const pageId = pages[0].id;
            const newContent = [{
                id: 'row-contact',
                type: 'row',
                config: { isFullWidth: true, paddingTop: '0', paddingBottom: '0' },
                children: [{
                    id: 'col-contact',
                    span: 12,
                    config: {},
                    children: [{
                        id: 'comp-contact',
                        type: 'contact-v4',
                        config: {
                            heroTagline: 'Experiencias de Lujo',
                            heroTitle: 'Hablemos de tu <br/><span>Próximo Hito</span>',
                            infoTagline: 'Exclusividad',
                            infoTitle: 'Conversemos',
                            infoDescription: 'Déjanos acompañarte en la creación de una experiencia inolvidable. Estamos listos para elevar tu visión y convertir tu próximo hito en algo legendario.',
                            formTitle: 'Envíanos un mensaje',
                            submitText: 'Solicitar Asesoría Exclusiva'
                        }
                    }]
                }]
            }];

            await conn.execute('UPDATE paginas_v4 SET content = ? WHERE id = ?', [JSON.stringify(newContent), pageId]);
            console.log('Page updated successfully');
        } else {
            console.log('Page not found');
        }
    } catch (e) {
        console.error('Update failed:', e);
    } finally {
        await conn.end();
    }
}

update();
