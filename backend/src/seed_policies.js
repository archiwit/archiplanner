const mysql = require('mysql2/promise');
require('dotenv').config();

// We reuse the existing pool logic partially or just define a local one for this script
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const pages = [
    {
        nombre: 'Política de Privacidad',
        slug: 'privacidad',
        descripcion: 'Términos de privacidad y manejo de datos personales.',
        estado: 'publicado',
        is_visible: 0,
        content: JSON.stringify([
            {
                id: 'row1',
                config: {},
                children: [
                    {
                        id: 'col1',
                        span: 12,
                        children: [
                            {
                                id: 'title1',
                                type: 'text',
                                config: {
                                    content: '<h1 style="font-size: 48px; text-align: center; margin-bottom: 40px;">Política de Privacidad</h1>',
                                    textAlign: 'center'
                                }
                            },
                            {
                                id: 'text1',
                                type: 'text',
                                config: {
                                    content: `
                                        <h3>1. Información que Recolectamos</h3>
                                        <p>En ArchiPlanner, recolectamos información personal que nos proporcionas directamente para la planificación de tu evento, incluyendo nombre, correo electrónico, teléfono y detalles específicos de la celebración.</p>
                                        <br/>
                                        <h3>2. Uso de la Información</h3>
                                        <p>Utilizamos tus datos exclusivamente para gestionar las cotizaciones, coordinar con proveedores externos autorizados y mantener comunicación sobre el progreso del evento.</p>
                                        <br/>
                                        <h3>3. Protección de Datos</h3>
                                        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no unauthorized o pérdida accidental.</p>
                                        <br/>
                                        <h3>4. Cookies</h3>
                                        <p>Nuestro sitio utiliza cookies para mejorar la experiencia de navegación y analizar el tráfico de forma anónima.</p>
                                    `,
                                    fontSize: '16px',
                                    textColor: '#ffffff',
                                    textAlign: 'left'
                                }
                            }
                        ]
                    }
                ]
            }
        ]),
        style_config: JSON.stringify({ canvasBg: '#0a0a0b', canvasText: '#ffffff' })
    },
    {
        nombre: 'Protección y Términos',
        slug: 'proteccion',
        descripcion: 'Condiciones generales de servicio y protección al consumidor.',
        estado: 'publicado',
        is_visible: 0,
        content: JSON.stringify([
            {
                id: 'row1',
                config: {},
                children: [
                    {
                        id: 'col1',
                        span: 12,
                        children: [
                            {
                                id: 'title1',
                                type: 'text',
                                config: {
                                    content: '<h1 style="font-size: 48px; text-align: center; margin-bottom: 40px;">Protección y Términos</h1>',
                                    textAlign: 'center'
                                }
                            },
                            {
                                id: 'text1',
                                type: 'text',
                                config: {
                                    content: `
                                        <h3>1. Aceptación de Términos</h3>
                                        <p>Al contratar los servicios de ArchiPlanner, el cliente acepta los términos y condiciones aquí descritos para la planeación y ejecución de eventos.</p>
                                        <br/>
                                        <h3>2. Reservas y Pagos</h3>
                                        <p>Toda reserva requiere un abono inicial para garantizar la fecha. Los pagos posteriores deberán realizarse según el cronograma acordado en la cotización oficial.</p>
                                        <br/>
                                        <h3>3. Política de Cancelación</h3>
                                        <p>Las cancelaciones por parte del cliente estarán sujetas a penalidades proporcionales al tiempo de anticipación y los gastos ya incurridos con proveedores.</p>
                                        <br/>
                                        <h3>4. Responsabilidad</h3>
                                        <p>ArchiPlanner actúa como intermediario y coordinador. No nos hacemos responsables por fallos directos de proveedores externos, aunque garantizamos la gestión de contingencias.</p>
                                    `,
                                    fontSize: '16px',
                                    textColor: '#ffffff',
                                    textAlign: 'left'
                                }
                            }
                        ]
                    }
                ]
            }
        ]),
        style_config: JSON.stringify({ canvasBg: '#0a0a0b', canvasText: '#ffffff' })
    },
    {
        nombre: 'Contacto',
        slug: 'contacto',
        descripcion: 'Página de contacto editable sistema V4.',
        estado: 'publicado',
        is_visible: 1,
        content: JSON.stringify([
            {
                id: 'row1',
                config: { },
                children: [
                    {
                        id: 'col1',
                        span: 12,
                        children: [
                            {
                                id: 'header1',
                                type: 'hero-modern',
                                config: {
                                    title: 'Hablemos de tu <br/><span style="color:#d4af37">Próximo Evento</span>',
                                    subtitle: 'Contacto Exclusivo',
                                    hook: 'Diseñamos experiencias que perduran en la memoria.',
                                    align: 'center'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'row2',
                config: { },
                children: [
                    {
                        id: 'col2',
                        span: 6,
                        children: [
                            {
                                id: 'text_info',
                                type: 'text',
                                config: {
                                    content: `
                                        <h2 style="font-size: 32px; margin-bottom: 20px;">Información de Contacto</h2>
                                        <p style="opacity:0.7; margin-bottom: 30px;">Estamos listos para transformar tus ideas en una realidad impecable. Agenda una cita en nuestro showroom o solicita una llamada.</p>
                                        <div style="display:flex; flex-direction:column; gap:15px;">
                                            <div><strong>DIRECCIÓN:</strong> Bogotá, Colombia</div>
                                            <div><strong>TELÉFONO:</strong> +57 300 000 0000</div>
                                            <div><strong>EMAIL:</strong> contacto@archiplanner.com</div>
                                        </div>
                                    `
                                }
                            }
                        ]
                    },
                    {
                        id: 'col3',
                        span: 6,
                        children: [
                            {
                                id: 'form1',
                                type: 'form',
                                config: {
                                    title: 'Solicitar Asesoría',
                                    buttonLabel: 'Enviar Mensaje'
                                }
                            }
                        ]
                    }
                ]
            }
        ]),
        style_config: JSON.stringify({ canvasBg: '#000000', canvasText: '#ffffff' })
    }
];

async function seed() {
    console.log('🌱 Seeding pages (Force Update)...');
    for (const page of pages) {
        try {
            // Check if exists
            const [existing] = await pool.query('SELECT id FROM web_paginas_v4 WHERE slug = ?', [page.slug]);
            
            if (existing.length > 0) {
                console.log(`🔄 Updating existing page /p/${page.slug}...`);
                const sql = `UPDATE web_paginas_v4 SET nombre = ?, descripcion = ?, estado = ?, is_visible = ?, content = ?, style_config = ? WHERE slug = ?`;
                await pool.query(sql, [page.nombre, page.descripcion, page.estado, page.is_visible, page.content, page.style_config, page.slug]);
                console.log(`✅ Page /p/${page.slug} updated.`);
            } else {
                const sql = `INSERT INTO web_paginas_v4 (nombre, slug, descripcion, estado, is_visible, content, style_config, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
                await pool.query(sql, [page.nombre, page.slug, page.descripcion, page.estado, page.is_visible, page.content, page.style_config]);
                console.log(`✅ Page /p/${page.slug} created.`);
            }
        } catch (err) {
            console.error(`❌ Error seeding /p/${page.slug}:`, err.message);
        }
    }
    await pool.end();
    console.log('✨ Seeding complete.');
}

seed();
