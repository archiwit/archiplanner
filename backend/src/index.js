const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./db');
const upload = require('./middleware/upload');
const serviciosRoutes = require('./routes/servicios');
const cmsWebRoutes = require('./routes/cms_web');
const paginasV4Routes = require('./routes/paginas_v4');
const alertasRoutes = require('./routes/alertas');
const notificationService = require('./services/notificationService');
const documentsRoutes = require('./routes/documents');
const itinerariosRoutes = require('./routes/itinerarios');
const inspiracionesRoutes = require('./routes/inspiraciones');
const itemsClaveRoutes = require('./routes/items_clave');
const clientFinanceRoutes = require('./routes/client_finance');
const googleRoutes = require('./routes/google');
const actividadesRoutes = require('./routes/actividades');


const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: '*', // Permitir todos los orígenes en desarrollo para máxima compatibilidad
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// logger de depuración
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/api/debug/users/:nick', async (req, res) => {
    try {
        const { nick } = req.params;
        const [users] = await db.query('SELECT id, nombre, nick, rol FROM usuarios WHERE nick = ?', [nick]);
        const [clients] = await db.query('SELECT id, nombre, nick FROM clientes WHERE nick = ?', [nick]);
        res.json({ users, clients });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DEBUG ROUTE (Temporary) ---
app.get('/api/debug/db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM cotizaciones');
        const [dbName] = await db.query('SELECT DATABASE() as db');
        res.json({
            database: dbName[0].db,
            count: rows[0].count,
            config: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                db: process.env.DB_NAME
            }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// PLANEADOR 360: INVITADOS Y LAYOUTS (TOP)
// ==========================================

// --- Invitados ---
app.get('/api/invitados/:cotId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM event_invitados WHERE cot_id = ? ORDER BY nombre ASC', [req.params.cotId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/invitados', async (req, res) => {
    const { cot_id, invitados } = req.body;
    if (!invitados || !Array.isArray(invitados)) return res.status(400).json({ error: 'Array de invitados requerido' });
    try {
        const values = invitados.map(i => [
            cot_id, i.nombre, i.celular || '', i.grupo || 'Otro', 
            i.categoria || 'Familiar', i.adultos || 1, i.niños || 0, 
            i.estado || 'Pendiente', i.mesa_id || null, i.observaciones || ''
        ]);
        const sql = 'INSERT INTO event_invitados (cot_id, nombre, celular, grupo, categoria, adultos, niños, estado, mesa_id, observaciones) VALUES ?';
        await db.query(sql, [values]);
        res.json({ success: true, message: 'Invitados procesados' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/invitados/:id', async (req, res) => {
    const { nombre, celular, grupo, categoria, adultos, niños, estado, mesa_id, observaciones } = req.body;
    try {
        await db.query(`UPDATE event_invitados SET 
            nombre=?, celular=?, grupo=?, categoria=?, adultos=?, niños=?, estado=?, mesa_id=?, observaciones=? 
            WHERE id=?`, 
            [nombre, celular, grupo, categoria, adultos, niños, estado, mesa_id, observaciones, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/invitados/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM event_invitados WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Layouts ---
app.get('/api/layouts/:cotId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM event_layouts WHERE cot_id = ?', [req.params.cotId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/layouts', async (req, res) => {
    const { cot_id, nombre, ancho_metros, largo_metros, escala_px_metro, is_metric, fondo_url, notas_montaje, materiales_globales } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO event_layouts (cot_id, nombre, ancho_metros, largo_metros, escala_px_metro, is_metric, fondo_url, notas_montaje, materiales_globales) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cot_id, nombre, ancho_metros, largo_metros, escala_px_metro, is_metric, fondo_url, notas_montaje, materiales_globales]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/layouts/:id', async (req, res) => {
    const { nombre, ancho_metros, largo_metros, escala_px_metro, is_metric, fondo_url, notas_montaje, materiales_globales } = req.body;
    try {
        await db.query(
            'UPDATE event_layouts SET nombre=?, ancho_metros=?, largo_metros=?, escala_px_metro=?, is_metric=?, fondo_url=?, notas_montaje=?, materiales_globales=? WHERE id=?',
            [nombre, ancho_metros, largo_metros, escala_px_metro, is_metric, fondo_url, notas_montaje, materiales_globales, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/layouts/delete/:id', async (req, res) => {
    try {
        console.log(`[LOG] DELETE (via POST) Layout id=${req.params.id}`);
        await db.query('DELETE FROM event_layout_elementos WHERE layout_id = ?', [req.params.id]);
        await db.query('DELETE FROM event_layouts WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { 
        console.error("[ERROR] DELETE Layout:", err);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/layout-elementos/:layoutId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM event_layout_elementos WHERE layout_id = ?', [req.params.layoutId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/layout-elementos/bulk/:layoutId', async (req, res) => {
    const { elementos } = req.body;
    const layoutId = req.params.layoutId;
    try {
        await db.query('DELETE FROM event_layout_elementos WHERE layout_id = ?', [layoutId]);
        if (elementos && elementos.length > 0) {
            const values = elementos.map(e => [
                layoutId, e.tipo, e.x, e.y, e.rotacion || 0, 
                e.puestos || 0, e.label || '', JSON.stringify(e.config_json || {})
            ]);
            await db.query('INSERT INTO event_layout_elementos (layout_id, tipo, x, y, rotacion, puestos, label, config_json) VALUES ?', [values]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Routes - Pagos & Gastos
const pagosRoutes = require('./routes/pagos');
const gastosRoutes = require('./routes/gastos');
const gastosEmpresaRoutes = require('./routes/gastos_empresa');

app.use('/api/documents', documentsRoutes);
app.use('/api/gastos-empresa', gastosEmpresaRoutes);

// ==========================================
// AUTHENTICATION & REGISTRATION
// ==========================================

// Endpoint para verificar disponibilidad de Nick/Email en AMBAS tablas
app.get('/api/auth/check-availability', async (req, res) => {
    const { nick, email } = req.query;
    try {
        let nickExists = false;
        let emailExists = false;

        if (nick) {
            const [[uNick], [cNick]] = await Promise.all([
                db.query('SELECT id FROM usuarios WHERE nick = ?', [nick]),
                db.query('SELECT id FROM clientes WHERE nick = ?', [nick])
            ]);
            if (uNick.length > 0 || cNick.length > 0) nickExists = true;
        }

        if (email) {
            const [[uEmail], [cEmail]] = await Promise.all([
                db.query('SELECT id FROM usuarios WHERE correo = ? OR email = ?', [email, email]),
                db.query('SELECT id FROM clientes WHERE correo = ?', [email])
            ]);
            if (uEmail.length > 0 || cEmail.length > 0) emailExists = true;
        }

        res.json({ nickExists, emailExists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { nick, clave } = req.body;
    try {
        console.log(`[AUTH] Intento de login: "${nick}"`);
        
        // Buscamos en AMBAS tablas para identificar el origen exacto
        const [[userRows], [clientRows]] = await Promise.all([
            db.query('SELECT * FROM usuarios WHERE (nick = ? OR correo = ? OR email = ?) AND clave = ?', [nick, nick, nick, clave]),
            db.query('SELECT * FROM clientes WHERE (nick = ? OR correo = ?) AND clave = ?', [nick, nick, clave])
        ]);

        // CASO 1: Coincidencia en USUARIOS (Staff/Equipo)
        if (userRows.length > 0) {
            const user = userRows[0];
            console.log(`[AUTH-RBAC] Login Exitoso en tabla USUARIOS: ID ${user.id}, Rol ${user.rol}`);
            
            const [linkedClient] = await db.query('SELECT id FROM clientes WHERE u_id = ?', [user.id]);
            const cliId = linkedClient.length > 0 ? linkedClient[0].id : null;

            const sessionUser = { 
                id: user.id, // Primary Key de la tabla usuarios
                cli_id: cliId,
                nombre: user.nombre, 
                apellido: user.apellido || '',
                nick: user.nick,
                telefono: user.telefono,
                email: user.email || user.correo,
                rol: user.rol, 
                permisos: user.permisos ? (typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos) : [],
                conf_id: user.conf_id, 
                foto: user.foto,
                origen: 'usuarios'
            };

            return res.json({
                success: true,
                user: sessionUser,
                token: 'simulated_jwt_token_staff_' + user.id
            });
        }

        // CASO 2: Coincidencia en CLIENTES (Portal Cliente)
        if (clientRows.length > 0) {
            const client = clientRows[0];
            console.log(`[AUTH-RBAC] Login Exitoso en tabla CLIENTES: ID ${client.id}`);
            
            const sessionUser = { 
                id: client.id, // Primary Key de la tabla clientes
                cli_id: client.id,
                u_id: client.u_id,
                nombre: client.nombre, 
                apellido: client.apellido,
                nick: client.nick,
                telefono: client.telefono,
                email: client.correo,
                rol: 'cliente', 
                conf_id: client.conf_id, 
                foto: client.foto,
                origen: 'clientes'
            };

            return res.json({
                success: true,
                user: sessionUser,
                token: 'simulated_jwt_token_client_' + client.id
            });
        }

        // FALLO
        res.status(401).json({ success: false, message: 'Usuario o clave incorrectos' });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/auth/register-public', async (req, res) => {
    const { nombre, apellido, nick, email, telefono, nacimiento, necesidad, clave } = req.body;
    try {
        // 1. Verificar si el usuario o correo ya existen
        const [existing] = await db.query('SELECT id FROM usuarios WHERE nick = ? OR correo = ?', [nick, email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario o el correo ya están registrados' });
        }

        // 2. Insertar en usuarios con rol 'cliente'
        const [resultUser] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, nick, clave, correo, telefono, rol, conf_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nick, clave, email, telefono, 'cliente', 1]
        );

        // 3. Crear registro en tabla clientes para CRM
        const [resultClient] = await db.query(
            'INSERT INTO clientes (nombre, apellido, nick, clave, correo, telefono, nacimiento, tipo_evento, estado, conf_id, u_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nick, clave, email, telefono, nacimiento, 'Sociales', 'prospecto', 1, resultUser.insertId, necesidad || 'Auto-Registro']
        );

        // 4. Notología / Alerta
        await notificationService.notifyNewClient({
            id: resultClient.insertId,
            nombre,
            apellido,
            email,
            telefono,
            necesidad
        });

        res.json({ 
            success: true, 
            user: { id: resultUser.insertId, nombre, nick, email, rol: 'cliente', conf_id: 1 },
            token: 'simulated_jwt_token' 
        });
    } catch (err) {
        console.error('Error en registro público:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { nombre, apellido, nick, clave, email, telefono, nacimiento, necesidad } = req.body;
    try {
        const [existingUser] = await db.query('SELECT u.id FROM usuarios u JOIN clientes c ON (u.nick = ? OR c.nick = ? OR u.correo = ? OR c.correo = ?)', [nick, nick, email, email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario o el correo ya están registrados en el sistema' });
        }

        const [resultUser] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, nick, clave, correo, telefono, rol, conf_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nick, clave, email, telefono, 'admin', 1]
        );

        console.log(`[CRM] Creando registro de cliente para: ${nombre} ${apellido}`);
        const [resultClient] = await db.query(
            'INSERT INTO clientes (nombre, apellido, nick, clave, correo, telefono, nacimiento, tipo_evento, estado, conf_id, u_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nick, clave, email, telefono, nacimiento, 'Sociales', 'prospecto', 1, resultUser.insertId, necesidad || 'Registro inicial']
        );

        await notificationService.notifyNewClient({
            id: resultClient.insertId,
            nombre,
            apellido,
            email,
            telefono,
            necesidad
        });
        
        res.json({ 
            success: true, 
            user: { id: resultUser.insertId, nombre, nick, email, rol: 'admin', conf_id: 1 },
            token: 'simulated_jwt_token'
        });
    } catch (err) {
        console.error('Error en registro admin:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/social-login', async (req, res) => {
    const { email, name, provider } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ? OR email = ?', [email, email]);
        if (rows.length > 0) {
            const user = rows[0];
            await db.query('UPDATE usuarios SET u_ultima_sesion = NOW() WHERE id = ?', [user.id]);
            return res.json({
                success: true,
                user: { id: user.id, nombre: user.nombre, rol: user.rol, conf_id: user.conf_id, foto: user.foto, email: user.email || user.correo },
                token: 'simulated_jwt_social_token'
            });
        }
        res.json({ success: false, needsCompletion: true, suggestedData: { name, email, provider } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/social-register-complete', async (req, res) => {
    const { nombre, apellido, email, telefono, provider } = req.body;
    try {
        const [existingPhone] = await db.query('SELECT u.* FROM usuarios u JOIN clientes c ON u.id = c.u_id WHERE u.telefono = ? OR c.telefono = ?', [telefono, telefono]);
        if (existingPhone.length > 0) {
            const existingUser = existingPhone[0];
            return res.json({
                success: false,
                phoneExists: true,
                message: `El número ${telefono} ya está asociado a la cuenta ${existingUser.correo || existingUser.email}.`,
                existingUser: { email: existingUser.correo || existingUser.email, nombre: existingUser.nombre }
            });
        }
        const nick = email.split('@')[0] + Math.floor(Math.random() * 100);
        const [resultUser] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, nick, clave, correo, telefono, rol, conf_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nick, `social_${provider}_${Date.now()}`, email, telefono, 'cliente', 1]
        );
        const [resultClient] = await db.query(
            'INSERT INTO clientes (nombre, apellido, nick, correo, telefono, estado, conf_id, u_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nick, email, telefono, 'prospecto', 1, resultUser.insertId, `Registro vía ${provider}`]
        );
        try {
            const notificationService = require('./services/notificationService');
            await notificationService.notifyNewClient({ id: resultClient.insertId, nombre, apellido, email, telefono, necesidad: `Registro vía ${provider}` });
        } catch (nErr) { console.warn('Error notología:', nErr.message); }
        res.json({ success: true, user: { id: resultUser.insertId, nombre, nick, email, rol: 'cliente', conf_id: 1 }, token: 'simulated_jwt_social_token' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/link-social-account', async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ? OR email = ?', [email, email]);
        if (rows.length > 0) {
            const user = rows[0];
            res.json({ success: true, user: { id: user.id, nombre: user.nombre, rol: user.rol, conf_id: user.conf_id, foto: user.foto, email: user.email || user.correo }, token: 'simulated_jwt_social_token' });
        } else { res.status(404).json({ success: false, message: 'No encontrado' }); }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [user] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'Correo no encontrado' });
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query('UPDATE usuarios SET reset_code = ? WHERE email = ?', [resetCode, email]);
        console.log(`[AUTH] Código de recuperación para ${email}: ${resetCode}`);
        res.json({ success: true, message: 'Código enviado a tu correo' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const [user] = await db.query('SELECT id FROM usuarios WHERE email = ? AND reset_code = ?', [email, code]);
        if (user.length === 0) {
            return res.status(400).json({ success: false, message: 'Código inválido o correo incorrecto' });
        }
        await db.query('UPDATE usuarios SET clave = ?, reset_code = NULL WHERE email = ?', [newPassword, email]);
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const dashboardRoutes = require('./routes/dashboard');

app.use('/api/pagos', pagosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/servicios', serviciosRoutes);
app.use('/api', cmsWebRoutes);
app.use('/api/paginas-v4', paginasV4Routes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/actividades', require('./routes/actividades'));
app.use('/api/itinerarios', itinerariosRoutes);
app.use('/api/inspiraciones', inspiracionesRoutes);
app.use('/api/items-clave', itemsClaveRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/client-finance', clientFinanceRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/actividades', actividadesRoutes);

// Automated Scan (Run on startup and every 12 hours)
const runAudit = async () => {
    try {
        console.log('[System] Iniciando auditoría automática...');
        await notificationService.runDailyChecks();
    } catch (err) {
        console.error("[System] Error en auditoría (BBDD puede no estar lista):", err.message);
    }
};

// Start the first audit
runAudit();
// Schedule every 12 hours
setInterval(runAudit, 12 * 60 * 60 * 1000);


// Routes - Configuration (Global Data)
app.get('/api/config', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM configuracion WHERE es_activa = 1 LIMIT 1');
        if (rows.length > 0) return res.json(rows[0]);
        const [latest] = await db.query('SELECT * FROM configuracion ORDER BY id DESC LIMIT 1');
        res.json(latest[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/config', upload.fields([{ name: 'logo_cuadrado', maxCount: 1 }, { name: 'logo_horizontal', maxCount: 1 }, { name: 'logo_black', maxCount: 1 }]), async (req, res) => {
    const { 
        nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url,
        color_primario, color_secundario, color_terciario, color_fondo, ceo, tt_url, li_url, x_url, web_url, 
        nav_config, footer_config,
        ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg
    } = req.body;
    try {
        const [activeConfig] = await db.query('SELECT id, logo_cuadrado_path, logo_horizontal_path, logo_black_path FROM configuracion WHERE es_activa = 1 LIMIT 1');
        const configId = activeConfig.length > 0 ? activeConfig[0].id : null;
        if (!configId) return res.status(404).json({ error: 'No hay configuración activa' });
        let lcp = req.body.logo_cuadrado_path || activeConfig[0].logo_cuadrado_path;
        let lhp = req.body.logo_horizontal_path || activeConfig[0].logo_horizontal_path;
        let lbp = req.body.logo_black_path || activeConfig[0].logo_black_path;
        if (req.files) {
            if (req.files.logo_cuadrado) lcp = `/uploads/config/${req.files.logo_cuadrado[0].filename}`;
            if (req.files.logo_horizontal) lhp = `/uploads/config/${req.files.logo_horizontal[0].filename}`;
            if (req.files.logo_black) lbp = `/uploads/config/${req.files.logo_black[0].filename}`;
        }
        await db.query(`UPDATE configuracion SET nombre_empresa=?, email_contacto=?, telefono=?, city=?, ig_url=?, fb_url=?, pn_url=?, pi_url=?, logo_cuadrado_path=?, logo_horizontal_path=?, logo_black_path=?, color_primario=?, color_secundario=?, color_terciario=?, color_fondo=?, ceo=?, tt_url=?, li_url=?, x_url=?, web_url=?, nav_config=?, footer_config=?, ig_svg=?, fb_svg=?, tt_svg=?, li_svg=?, x_svg=?, ws_svg=?, pi_svg=?, icon_contact_svg=?, icon_footer_svg=? WHERE id=?`, [nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url, lcp, lhp, lbp, color_primario, color_secundario, color_terciario, color_fondo, ceo, tt_url, li_url, x_url, web_url, nav_config, footer_config, ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg, configId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Full CRUD for configuraciones (Admin Panel)
app.get('/api/configuraciones', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM configuracion ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/configuraciones', upload.fields([{ name: 'logo_cuadrado', maxCount: 1 }, { name: 'logo_horizontal', maxCount: 1 }, { name: 'logo_black', maxCount: 1 }]), async (req, res) => {
    const { nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url, color_primario, color_secundario, color_terciario, color_fondo, intro_cotizacion, politicas_cotizacion, ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion, nav_config, footer_config, ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg } = req.body;
    let lcp = null, lhp = null, lbp = null;
    if (req.files) {
        if (req.files.logo_cuadrado) lcp = `/uploads/config/${req.files.logo_cuadrado[0].filename}`;
        if (req.files.logo_horizontal) lhp = `/uploads/config/${req.files.logo_horizontal[0].filename}`;
        if (req.files.logo_black) lbp = `/uploads/config/${req.files.logo_black[0].filename}`;
    }
    try {
        const [result] = await db.query(`INSERT INTO configuracion (nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url, logo_cuadrado_path, logo_horizontal_path, logo_black_path, color_primario, color_secundario, color_terciario, color_fondo, intro_cotizacion, politicas_cotizacion, ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion, nav_config, footer_config, ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url, lcp, lhp, lbp, color_primario, color_secundario, color_terciario, color_fondo, intro_cotizacion, politicas_cotizacion, ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion, nav_config, footer_config, ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg]);
        res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/configuraciones/:id', upload.fields([{ name: 'logo_cuadrado', maxCount: 1 }, { name: 'logo_horizontal', maxCount: 1 }, { name: 'logo_black', maxCount: 1 }]), async (req, res) => {
    const { 
        nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url,
        color_primario, color_secundario, color_terciario, color_fondo, 
        intro_cotizacion, politicas_cotizacion, 
        ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion,
        nav_config, footer_config,
        ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg
    } = req.body;
    
    let logo_cuadrado_path = req.body.logo_cuadrado_path;
    let logo_horizontal_path = req.body.logo_horizontal_path;
    let logo_black_path = req.body.logo_black_path;

    if (req.files) {
        if (req.files.logo_cuadrado) logo_cuadrado_path = `/uploads/config/${req.files.logo_cuadrado[0].filename}`;
        if (req.files.logo_horizontal) logo_horizontal_path = `/uploads/config/${req.files.logo_horizontal[0].filename}`;
        if (req.files.logo_black) logo_black_path = `/uploads/config/${req.files.logo_black[0].filename}`;
    }
    
    try {
        await db.query(`
            UPDATE configuracion SET 
            nombre_empresa = ?, email_contacto = ?, telefono = ?, city = ?, ig_url = ?, fb_url = ?, pn_url = ?, pi_url = ?, 
            logo_cuadrado_path = ?, logo_horizontal_path = ?, logo_black_path = ?,
            color_primario = ?, color_secundario = ?, color_terciario = ?, color_fondo = ?,
            intro_cotizacion = ?, politicas_cotizacion = ?,
            ceo = ?, tt_url = ?, li_url = ?, x_url = ?, web_url = ?,
            cedula = ?, ciudad_expedicion = ?,
            nav_config = ?, footer_config = ?,
            ig_svg = ?, fb_svg = ?, tt_svg = ?, li_svg = ?, x_svg = ?, ws_svg = ?, pi_svg = ?, icon_contact_svg = ?, icon_footer_svg = ?
            WHERE id = ?
        `, [
            nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, pi_url, 
            logo_cuadrado_path, logo_horizontal_path, logo_black_path,
            color_primario, color_secundario, color_terciario, color_fondo,
            intro_cotizacion, politicas_cotizacion,
            ceo, tt_url, li_url, x_url, web_url,
            cedula, ciudad_expedicion,
            nav_config, footer_config,
            ig_svg, fb_svg, tt_svg, li_svg, x_svg, ws_svg, pi_svg, icon_contact_svg, icon_footer_svg,
            req.params.id
        ]);
        
        res.json({ success: true, message: 'Configuración actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to set a company as active
app.put('/api/configuraciones/:id/activar', async (req, res) => {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            // Deactivate ALL companies
            await connection.query('UPDATE configuracion SET es_activa = 0');
            // Activate ONLY the specified one
            await connection.query('UPDATE configuracion SET es_activa = 1 WHERE id = ?', [req.params.id]);
            await connection.commit();
            res.json({ success: true, message: 'Empresa activada correctamente' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/configuraciones/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT logo_cuadrado_path, logo_horizontal_path FROM configuracion WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            if (rows[0].logo_cuadrado_path) {
                const filePath = path.join(__dirname, '..', rows[0].logo_cuadrado_path);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            if (rows[0].logo_horizontal_path) {
                const filePath = path.join(__dirname, '..', rows[0].logo_horizontal_path);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }
        await db.query('DELETE FROM configuracion WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Configuración eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes - Articles (Inventory) - Full CRUD with Provider association
app.get('/api/articulos', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, COALESCE(p.nombre, 'ArchiPlanner') as nombre_proveedor
            FROM articulos a
            LEFT JOIN proveedores p ON a.pro_id = p.id
            ORDER BY a.categoria, a.nombre ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/articulos', upload.single('foto'), async (req, res) => {
    const { nombre, categoria, precio_u, costo_u, uni_medida, nota, pro_id } = req.body;
    const foto = req.file ? `/uploads/items/${req.file.filename}` : null;

    try {
        const p_u = parseFloat(String(precio_u || 0).replace(',', '.'));
        const c_u = parseFloat(String(costo_u || 0).replace(',', '.'));
        const [result] = await db.query(
            'INSERT INTO articulos (nombre, categoria, precio_u, costo_u, uni_medida, nota, foto, pro_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, categoria, p_u, c_u, uni_medida || 'unidad', nota || '', foto, pro_id || null]
        );
        res.json({ success: true, id: result.insertId, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/articulos/:id', upload.single('foto'), async (req, res) => {
    const { nombre, categoria, precio_u, costo_u, uni_medida, nota, pro_id } = req.body;
    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/items/${req.file.filename}`;
    }

    try {
        const p_u = parseFloat(String(precio_u || 0).replace(',', '.'));
        const c_u = parseFloat(String(costo_u || 0).replace(',', '.'));
        await db.query(
            'UPDATE articulos SET nombre=?, categoria=?, precio_u=?, costo_u=?, uni_medida=?, nota=?, foto=?, pro_id=? WHERE id=?',
            [nombre, categoria, p_u, c_u, uni_medida || 'unidad', nota || '', foto, pro_id || null, req.params.id]
        );
        res.json({ success: true, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/articulos/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT foto FROM articulos WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].foto) {
            const filePath = path.join(__dirname, '..', rows[0].foto);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await db.query('DELETE FROM articulos WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Las rutas de Dashboard ahora se manejan en src/routes/dashboard.js

// Routes - Usuarios (User Management)
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.nombre, u.nick, u.correo, u.telefono, u.direccion, u.rol, u.estado, u.u_ultima_sesion, u.conf_id, u.foto, u.permisos, c.nombre_empresa 
            FROM usuarios u 
            LEFT JOIN configuracion c ON u.conf_id = c.id 
            ORDER BY u.id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/usuarios', upload.single('foto'), async (req, res) => {
    const { nombre, nick, clave, correo, telefono, direccion, rol, conf_id, estado, permisos } = req.body;
    const foto = req.file ? `/uploads/users/${req.file.filename}` : null;
    
    try {
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, nick, clave, correo, telefono, direccion, rol, conf_id, foto, estado, permisos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, nick, clave, correo, telefono, direccion, rol, conf_id || 1, foto, estado === 'Activos' || estado === 'Activo' || estado === 'true' || estado === 1 ? 1 : 0, permisos]
        );
        res.json({ success: true, id: result.insertId, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/usuarios/:id', upload.single('foto'), async (req, res) => {
    const { nombre, nick, clave, correo, telefono, direccion, rol, conf_id, estado, permisos } = req.body;

    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/users/${req.file.filename}`;
    }
    
    try {
        const isActivo = (estado === 'Activo' || estado === 'true' || estado === 1 || estado === '1') ? 1 : 0;
        if (clave && clave.length > 0) {
            await db.query(
                'UPDATE usuarios SET nombre=?, nick=?, clave=?, correo=?, telefono=?, direccion=?, rol=?, conf_id=?, foto=?, estado=?, permisos=? WHERE id=?',
                [nombre, nick, clave, correo, telefono, direccion, rol, conf_id || 1, foto, isActivo, permisos, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre=?, nick=?, correo=?, telefono=?, direccion=?, rol=?, conf_id=?, foto=?, estado=?, permisos=? WHERE id=?',
                [nombre, nick, correo, telefono, direccion, rol, conf_id || 1, foto, isActivo, permisos, req.params.id]
            );
        }
        res.json({ success: true, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Safe endpoint for users editing their own profile
app.put('/api/usuarios/:id/perfil', upload.single('foto'), async (req, res) => {
    const { nombre, nick, clave, correo, telefono } = req.body;
    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/users/${req.file.filename}`;
    }
    
    try {
        if (clave && clave.length > 0) {
            await db.query(
                'UPDATE usuarios SET nombre=?, nick=?, clave=?, correo=?, telefono=?, foto=? WHERE id=?',
                [nombre, nick, clave, correo, telefono, foto, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre=?, nick=?, correo=?, telefono=?, foto=? WHERE id=?',
                [nombre, nick, correo, telefono, foto, req.params.id]
            );
        }
        res.json({ success: true, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Safe endpoint for clients editing their own profile
app.put('/api/clientes/:id/perfil', upload.single('foto'), async (req, res) => {
    const { 
        nombre, apellido, nick, clave, correo, telefono,
        nacimiento, direccion, documento, ciudad_cedula 
    } = req.body;
    
    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/clientes/${req.file.filename}`;
    }
    
    try {
        const queryParams = [
            nombre, apellido || '', nick, correo, telefono, 
            nacimiento || null, direccion || null, 
            documento || null, documento || null, // documento y cedula
            ciudad_cedula || null, ciudad_cedula || null, // ciudad_cedula y expedicion
            foto, req.params.id
        ];

        let sql = `UPDATE clientes SET 
            nombre=?, apellido=?, nick=?, correo=?, telefono=?, 
            nacimiento=?, direccion=?, documento=?, cedula=?, ciudad_cedula=?, expedicion=?,
            foto=?`;

        if (clave && clave.length > 0) {
            sql += `, clave=? WHERE id=?`;
            queryParams.splice(queryParams.length - 1, 0, clave); // Insert clave before id
        } else {
            sql += ` WHERE id=?`;
        }

        await db.query(sql, queryParams);
        res.json({ success: true, foto });
    } catch (err) {
        console.error('Error al actualizar perfil cliente:', err);
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/usuarios/:id/perfil-stats', async (req, res) => {
    try {
         const u_id = req.params.id;
         const [user] = await db.query('SELECT u.id, u.nombre, u.nick, u.correo, u.telefono, u.rol, u.foto, u.conf_id, c.nombre_empresa FROM usuarios u LEFT JOIN configuracion c ON u.conf_id = c.id WHERE u.id = ?', [u_id]);
         if (!user.length) return res.status(404).json({ error: 'Usuario no encontrado' });

         const [clientesCount] = await db.query('SELECT COUNT(*) as c FROM clientes WHERE u_id = ?', [u_id]);
         const [cotizacionesCount] = await db.query('SELECT COUNT(*) as c FROM cotizaciones WHERE u_id = ?', [u_id]);
         const [eventosCount] = await db.query(`SELECT COUNT(*) as c FROM clientes WHERE u_id = ? AND estado IN ('contratado', 'completado')`, [u_id]);
         const [ultimosClientes] = await db.query(`SELECT id, nombre, apellido, tipo_evento, fevento, estado FROM clientes WHERE u_id = ? ORDER BY id DESC LIMIT 5`, [u_id]);
         
         res.json({
             user: user[0],
             stats: {
                 clientes: clientesCount[0].c,
                 cotizaciones: cotizacionesCount[0].c,
                 eventosActivos: eventosCount[0].c
             },
             ultimosClientes
         });
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});


// Instagram Route (Dynamic Social Feed)
// ==========================================
// RUTAS DE CLIENTES (CRUD Completo)
// ==========================================
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, u.nombre as nombre_usuario, c2.nombre_empresa, c2.logo_cuadrado_path as logo_empresa
            FROM clientes c
            LEFT JOIN usuarios u ON c.u_id = u.id
            LEFT JOIN configuracion c2 ON c.conf_id = c2.id
            ORDER BY c.id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        
        // Normalizar para compatibilidad con authUser (correo/email)
        const client = rows[0];
        res.json({
            ...client,
            email: client.correo
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clientes', upload.single('foto'), async (req, res) => {
    const { 
        nombre, apellido, correo, telefono, documento, 
        ciudad_cedula, nacimiento, direccion, cedorigen, 
        estado, u_id, conf_id, notas 
    } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Default conf_id logic: 1 if not provided
    const finalConfId = conf_id || 1;

    try {
        const [result] = await db.query(
            `INSERT INTO clientes (
                nombre, apellido, correo, telefono, documento, 
                ciudad_cedula, nacimiento, direccion, cedorigen, 
                estado, u_id, conf_id, notas, foto
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, apellido, correo, telefono, documento, 
                ciudad_cedula, nacimiento, direccion, cedorigen, 
                estado || 'prospecto', u_id || 1, finalConfId, notas, foto
            ]
        );
        res.json({ success: true, id: result.insertId, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/clientes/:id', upload.single('foto'), async (req, res) => {
    const {
        nombre, apellido, nick, clave, correo, telefono, documento, ciudad_cedula,
        nacimiento, direccion, cedorigen, fevento, estado, contactar, ultimocontac, notas, u_id, conf_id
    } = req.body;
    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/clientes/${req.file.filename}`;
    }

    try {
        if (clave && clave.length > 0) {
            await db.query(`
                UPDATE clientes SET
                nombre=?, apellido=?, nick=?, clave=?, correo=?, telefono=?, documento=?, ciudad_cedula=?,
                nacimiento=?, direccion=?, cedorigen=?, 
                fevento=?, estado=?, contactar=?, ultimocontac=?, notas=?, foto=?, u_id=?, conf_id=?
                WHERE id=?
            `, [
                nombre, apellido, nick, clave, correo, telefono, documento, ciudad_cedula,
                nacimiento, direccion, cedorigen,
                fevento, estado, contactar, ultimocontac, notas, foto, u_id, conf_id || 1, req.params.id
            ]);
        } else {
            await db.query(`
                UPDATE clientes SET
                nombre=?, apellido=?, nick=?, correo=?, telefono=?, documento=?, ciudad_cedula=?,
                nacimiento=?, direccion=?, cedorigen=?, 
                fevento=?, estado=?, contactar=?, ultimocontac=?, notas=?, foto=?, u_id=?, conf_id=?
                WHERE id=?
            `, [
                nombre, apellido, nick, correo, telefono, documento, ciudad_cedula,
                nacimiento, direccion, cedorigen,
                fevento, estado, contactar, ultimocontac, notas, foto, u_id, conf_id || 1, req.params.id
            ]);
        }
        res.json({ success: true, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT foto FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].foto) {
            const filePath = require('path').join(__dirname, '..', rows[0].foto);
            if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
        }
        await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// RUTAS DE PROVEEDORES (CRUD Completo)
// ==========================================
app.get('/api/proveedores', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM proveedores ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/proveedores', upload.single('foto'), async (req, res) => {
    const { nombre, contacto, telefono, correo, servicios, direccion, califica, estado } = req.body;
    const foto = req.file ? `/uploads/providers/${req.file.filename}` : null;

    try {
        let serviciosJson = [];
        try {
            if (typeof servicios === 'string' && servicios.trim().startsWith('[')) {
                serviciosJson = JSON.parse(servicios);
            } else if (typeof servicios === 'string' && servicios.trim().length > 0) {
                // Fallback for comma separated strings
                serviciosJson = servicios.split(',').map(s => s.trim());
            } else {
                serviciosJson = Array.isArray(servicios) ? servicios : [];
            }
        } catch (e) {
            console.error('Error parsing servicios:', e, 'Raw value:', servicios);
            serviciosJson = [];
        }
        
        const rating = parseFloat(String(califica || 0).replace(',', '.'));
        const [result] = await db.query(`
            INSERT INTO proveedores (nombre, contacto, telefono, correo, servicios, direccion, califica, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [nombre, contacto, telefono, correo, JSON.stringify(serviciosJson), direccion, rating, (estado === 'Activo' || estado === 'true' || estado === 1 || estado === '1') ? 1 : 0]);
        res.json({ success: true, id: result.insertId, foto });
    } catch (err) {
        console.error('DATABASE ERROR (POST /api/proveedores):', err);
        res.status(500).json({ error: 'Error en base de datos: ' + err.message, stack: err.stack });
    }
});

app.put('/api/proveedores/:id', upload.single('foto'), async (req, res) => {
    const { nombre, contacto, telefono, correo, servicios, direccion, califica, estado } = req.body;
    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/providers/${req.file.filename}`;
    }

    try {
        let serviciosJson = [];
        try {
            if (typeof servicios === 'string' && servicios.trim().startsWith('[')) {
                serviciosJson = JSON.parse(servicios);
            } else if (typeof servicios === 'string' && servicios.trim().length > 0) {
                // Fallback for comma separated strings
                serviciosJson = servicios.split(',').map(s => s.trim());
            } else {
                serviciosJson = Array.isArray(servicios) ? servicios : [];
            }
        } catch (e) {
            console.error('Error parsing servicios:', e, 'Raw value:', servicios);
            serviciosJson = [];
        }
        
        const rating = parseFloat(String(califica || 0).replace(',', '.'));
        const isActivo = (estado === 'Activo' || estado === 'true' || estado === 1 || estado === '1') ? 1 : 0;
        await db.query(`
            UPDATE proveedores SET
            nombre=?, contacto=?, telefono=?, correo=?, servicios=?, direccion=?, califica=?, estado=?, foto=?
            WHERE id=?
        `, [nombre, contacto, telefono, correo, JSON.stringify(serviciosJson), direccion, rating, isActivo, foto, req.params.id]);
        res.json({ success: true, foto });
    } catch (err) {
        console.error('DATABASE ERROR (PUT /api/proveedores/:id):', err);
        res.status(500).json({ error: 'Error en base de datos: ' + err.message, stack: err.stack });
    }
});

app.delete('/api/proveedores/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT foto FROM proveedores WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].foto) {
            const filePath = require('path').join(__dirname, '..', rows[0].foto);
            if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
        }
        // Unlink articles first to avoid FK constraint errors
        await db.query('UPDATE articulos SET pro_id = NULL WHERE pro_id = ?', [req.params.id]);
        await db.query('DELETE FROM proveedores WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('DATABASE ERROR (DELETE /api/proveedores/:id):', err);
        res.status(500).json({ error: 'Error en base de datos: ' + err.message, stack: err.stack });
    }
});

// Instagram Route (Dynamic Social Feed)
app.get('/api/instagram', async (req, res) => {
    try {
        const IG_USER_ID = (process.env.IG_USER_ID || '').trim();
        const ACCESS_TOKEN = (process.env.IG_ACCESS_TOKEN || '').trim();

        // Mock data constant for fallbacks (Unsplash curated luxury/architecture images)
        const MOCK_DATA = [
            { id: 'm1', media_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400', permalink: 'https://www.instagram.com/archi.planner/', caption: 'ArchiPlanner Luxury Event', media_type: 'IMAGE' },
            { id: 'm2', media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400', permalink: 'https://www.instagram.com/archi.planner/', caption: 'Elegance in Detail', media_type: 'IMAGE' },
            { id: 'm3', media_url: 'https://images.unsplash.com/photo-1487958449913-d9279906474c?q=80&w=400', permalink: 'https://www.instagram.com/archi.planner/', caption: 'Modern Architecture Design', media_type: 'IMAGE' }
        ];

        // If credentials are missing or default, return mock data
        if (!IG_USER_ID || !ACCESS_TOKEN || ACCESS_TOKEN === 'placeholder' || IG_USER_ID.length < 5) {
            console.log('Instagram: Missing or invalid credentials.');
            return res.json(MOCK_DATA);
        }

        /**
         * Graph API 2026 Standard for Instagram Business Account
         * URL: https://graph.instagram.com/{ig-user-id}/media
         */
        const encodedToken = encodeURIComponent(ACCESS_TOKEN);
        const url = `https://graph.instagram.com/v25.0/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=10&access_token=${encodedToken}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Instagram Graph API Error:', data.error.message);
            // Return mock data directly so frontend can render it
            return res.json(MOCK_DATA);
        }

        res.json(data.data || MOCK_DATA);
    } catch (error) {
        console.error('Instagram Fetch Exception:', error);
        // Absolute fallback: return mock data even on total crash
        res.json([
            { id: 'm1', media_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400', permalink: 'https://www.instagram.com/archi.planner/', caption: 'ArchiPlanner Luxury Event', media_type: 'IMAGE' },
            { id: 'm2', media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400', permalink: 'https://www.instagram.com/archi.planner/', caption: 'Elegance in Detail', media_type: 'IMAGE' },
            { id: 'm3', media_url: 'https://images.unsplash.com/photo-1487958449913-d9279906474c?q=80&w=400', permalink: 'https://www.instagram.com/archi.planner/', caption: 'Modern Architecture Design', media_type: 'IMAGE' }
        ]);
    }
});

// ==========================================
// RUTAS DE COTIZACIONES
// ==========================================
app.get('/api/cotizaciones/proximo-numero', async (req, res) => {
    try {
        const { clase } = req.query;
        let query = "";
        let prefix = "";

        if (clase === 'arriendo') {
            // Buscar el máximo de num_arriendo o num que empiece con ARR-
            query = "SELECT num FROM cotizaciones WHERE clase = 'arriendo' AND num LIKE 'ARR-%' ORDER BY num DESC LIMIT 1";
            prefix = "ARR-";
        } else {
            // Buscar el máximo numérico para eventos
            query = "SELECT num FROM cotizaciones WHERE (clase = 'evento' OR clase IS NULL) AND num NOT LIKE 'ARR-%' AND num REGEXP '^[0-9]+$' ORDER BY CAST(num AS UNSIGNED) DESC LIMIT 1";
        }

        const [rows] = await db.query(query);
        let nextNum = 1001; // Valor base si no hay nada

        if (rows.length > 0) {
            const lastNumStr = rows[0].num;
            if (clase === 'arriendo') {
                const numericPart = lastNumStr.replace('ARR-', '');
                nextNum = parseInt(numericPart, 10) + 1;
            } else {
                nextNum = parseInt(lastNumStr, 10) + 1;
            }
        } else if (clase === 'arriendo') {
            nextNum = 1; // Primer arriendo
        }

        const finalNum = clase === 'arriendo' 
            ? `ARR-${nextNum.toString().padStart(4, '0')}`
            : nextNum.toString();

        res.json({ nextNum: finalNum });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cotizaciones', async (req, res) => {
    try {
        const params = [];
        const { clase } = req.query;
        let whereClause = "";

        if (clase) {
            whereClause = "WHERE c.clase = ?";
            params.push(clase);
        } else {
            // v5.3: Por defecto solo mostrar eventos (clase='evento') si no se especifica
            whereClause = "WHERE (c.clase = 'evento' OR c.clase IS NULL)";
        }

        let query = `
            SELECT c.*, cl.nombre as cliente_nombre, cl.apellido as cliente_apellido, u.nombre as usuario_nombre,
                   cf.nombre_empresa, cf.logo_cuadrado_path as logo_empresa,
                   cl.conf_id as client_conf_id
            FROM cotizaciones c
            LEFT JOIN clientes cl ON c.cli_id = cl.id
            LEFT JOIN usuarios u ON c.u_id = u.id
            LEFT JOIN configuracion cf ON COALESCE(c.conf_id, cl.conf_id) = cf.id
            ${whereClause}
            ORDER BY c.id DESC
        `;
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cotizaciones/:id', async (req, res) => {
    try {
        const [coti] = await db.query('SELECT * FROM cotizaciones WHERE id = ?', [req.params.id]);
        if (coti.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
        
        const [detalles] = await db.query(`
            SELECT d.*, 
                   COALESCE(a.nombre, l.nombre) as nombre, 
                   COALESCE(a.categoria, l.tipo, 'General') as categoria, 
                   COALESCE(p.nombre, 'ArchiPlanner') as nombre_proveedor,
                   a.foto as art_foto, l.foto as loc_foto
            FROM cotizacion_detalles d
            LEFT JOIN articulos a ON d.art_id = a.id
            LEFT JOIN locaciones l ON d.loc_id = l.id
            LEFT JOIN proveedores p ON a.pro_id = p.id
            WHERE d.cot_id = ?
        `, [req.params.id]);

        const [cliente] = await db.query('SELECT * FROM clientes WHERE id = ?', [coti[0].cli_id]);
        
        // Prioritize quotation's company, fallback to client's company
        const finalConfId = coti[0].conf_id || (cliente[0] && cliente[0].conf_id) || 1;
        const [config] = await db.query('SELECT * FROM configuracion WHERE id = ?', [finalConfId]);
        
        res.json({ 
            ...coti[0], 
            conf_id: finalConfId,
            detalles, 
            cliente: cliente[0] || {}, 
            config: config[0] || {} 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cotizaciones', async (req, res) => {
    const { 
        conf_id, num, cli_id, u_id, fcoti, fevent, fevent_fin, num_adultos, num_ninos, 
        hora_inicio, hora_fin, lugar, loc_id, tematica, tipo_evento, 
        paleta_colores, subt, iva, aplica_iva, mostrar_precios, total, total_tipo, monto_final, 
        estado, notas, detalles, notas_entrega, notas_devolucion 
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // v5.3: Validar que el u_id existe para evitar fallos de integridad referencial
        const [userCheck] = await connection.query('SELECT id FROM usuarios WHERE id = ?', [parseInt(u_id)]);
        const final_u_id = userCheck.length > 0 ? parseInt(u_id) : 1;

        const [result] = await connection.query(`
            INSERT INTO cotizaciones 
            (conf_id, num, num_arriendo, clase, cli_id, u_id, fcoti, fevent, fevent_fin, num_adultos, num_ninos, hora_inicio, hora_fin, lugar, loc_id, tematica, tipo_evento, paleta_colores, subt, iva, aplica_iva, mostrar_precios, total, total_tipo, monto_final, estado, notas, notas_entrega, notas_devolucion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            parseInt(req.body.conf_id) || 1, 
            req.body.num, 
            req.body.num_arriendo || null,
            req.body.clase || 'evento',
            parseInt(req.body.cli_id) || 0, 
            final_u_id, 
            req.body.fcoti, 
            req.body.fevent || null, 
            req.body.fevent_fin || req.body.fevent || null, 
            parseInt(req.body.num_adultos) || 0, 
            parseInt(req.body.num_ninos) || 0, 
            req.body.hora_inicio || null, 
            req.body.hora_fin || null, 
            req.body.lugar || '', 
            req.body.loc_id ? parseInt(req.body.loc_id) : null, 
            req.body.tematica || '', 
            req.body.tipo_evento || '', 
            req.body.paleta_colores || '', 
            parseFloat(req.body.subt) || 0, 
            parseFloat(req.body.iva) || 0, 
            req.body.aplica_iva ? 1 : 0, 
            req.body.mostrar_precios ? 1 : 0, 
            parseFloat(req.body.total) || 0, 
            req.body.total_tipo || 'calculado', 
            parseFloat(req.body.monto_final) || 0, 
            req.body.estado || 'borrador', 
            req.body.notas || '',
            req.body.notas_entrega || '',
            req.body.notas_devolucion || ''
        ]);
        
        const cot_id = result.insertId;

        if (detalles && detalles.length > 0) {
            const detailValues = detalles.map(d => [
                cot_id, 
                d.art_id ? parseInt(d.art_id) : null, 
                d.loc_id ? parseInt(d.loc_id) : null, 
                parseFloat(d.cantidad) || 1, 
                parseFloat(d.costo_u) || 0, 
                parseFloat(d.precio_u) || 0, 
                parseFloat(d.subtotal) || 0, 
                d.notas || '', 
                d.por_persona ? 1 : 0
            ]);
            await connection.query(`
                INSERT INTO cotizacion_detalles (cot_id, art_id, loc_id, cantidad, costo_u, precio_u, subtotal, notas, por_persona)
                VALUES ?
            `, [detailValues]);
        }

        // Log initial creation
        await connection.query(
            'INSERT INTO cotizaciones_seguimiento (cot_id, u_id, comentario, estado_nuevo) VALUES (?, ?, ?, ?)',
            [cot_id, final_u_id, 'Cotización creada', estado || 'borrador']
        );

        // Alerta inmediata al SuperAdmin/Staff si es un Arriendo
        if (req.body.clase === 'arriendo') {
            await connection.query(`
                INSERT INTO alertas (titulo, mensaje, tipo, leida, fecha_creacion)
                VALUES (?, ?, ?, 0, NOW())
            `, [
                'Nuevo Arriendo Registrado',
                `Se ha generado el arriendo #${num} por el asesor ID: ${final_u_id}`,
                'arriendo'
            ]);
        }

        await connection.commit();
        res.json({ success: true, id: cot_id });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.put('/api/cotizaciones/:id', async (req, res) => {
    const { 
        conf_id, num, cli_id, u_id, fcoti, fevent, fevent_fin, num_adultos, num_ninos, 
        hora_inicio, hora_fin, lugar, loc_id, tematica, tipo_evento, 
        paleta_colores, subt, iva, aplica_iva, mostrar_precios, total, total_tipo, monto_final, 
        estado, notas, detalles 
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // v5.3: Validar que el u_id existe para evitar fallos de integridad referencial
        const [userCheck] = await connection.query('SELECT id FROM usuarios WHERE id = ?', [parseInt(u_id)]);
        const final_u_id = userCheck.length > 0 ? parseInt(u_id) : 1;

        // Check for state change to log it
        const [oldStateRow] = await connection.query('SELECT estado FROM cotizaciones WHERE id = ?', [req.params.id]);
        const oldState = oldStateRow.length > 0 ? oldStateRow[0].estado : null;

        await connection.query(`
            UPDATE cotizaciones SET
            conf_id=?, num=?, num_arriendo=?, clase=?, cli_id=?, u_id=?, fcoti=?, fevent=?, fevent_fin=?, num_adultos=?, num_ninos=?, 
            hora_inicio=?, hora_fin=?, lugar=?, loc_id=?, tematica=?, tipo_evento=?, 
            paleta_colores=?, subt=?, iva=?, aplica_iva=?, mostrar_precios=?, total=?, total_tipo=?, monto_final=?, 
            estado=?, notas=?, notas_entrega=?, notas_devolucion=?
            WHERE id=?
        `, [
            parseInt(req.body.conf_id) || 1, 
            req.body.num, 
            req.body.num_arriendo || null,
            req.body.clase || 'evento',
            parseInt(req.body.cli_id) || 0, 
            final_u_id, 
            req.body.fcoti, 
            req.body.fevent || null, 
            req.body.fevent_fin || req.body.fevent || null, 
            parseInt(req.body.num_adultos) || 0, 
            parseInt(req.body.num_ninos) || 0, 
            req.body.hora_inicio || null, 
            req.body.hora_fin || null, 
            req.body.lugar || '', 
            req.body.loc_id ? parseInt(req.body.loc_id) : null, 
            req.body.tematica || '', 
            req.body.tipo_evento || '', 
            req.body.paleta_colores || '', 
            parseFloat(req.body.subt) || 0, 
            parseFloat(req.body.iva) || 0, 
            req.body.aplica_iva ? 1 : 0, 
            req.body.mostrar_precios ? 1 : 0, 
            parseFloat(req.body.total) || 0, 
            req.body.total_tipo || 'calculado', 
            parseFloat(req.body.monto_final) || 0, 
            req.body.estado || 'borrador', 
            req.body.notas || '',
            req.body.notas_entrega || '',
            req.body.notas_devolucion || '',
            req.params.id
        ]);

        // Delete old details and insert new ones
        await connection.query('DELETE FROM cotizacion_detalles WHERE cot_id = ?', [req.params.id]);

        if (detalles && detalles.length > 0) {
            const detailValues = detalles.map(d => [
                req.params.id, 
                d.art_id ? parseInt(d.art_id) : null, 
                d.loc_id ? parseInt(d.loc_id) : null, 
                parseFloat(d.cantidad) || 1, 
                parseFloat(d.costo_u) || 0, 
                parseFloat(d.precio_u) || 0, 
                parseFloat(d.subtotal) || 0, 
                d.notas || '', 
                d.por_persona ? 1 : 0
            ]);
            await connection.query(`
                INSERT INTO cotizacion_detalles (cot_id, art_id, loc_id, cantidad, costo_u, precio_u, subtotal, notas, por_persona)
                VALUES ?
            `, [detailValues]);
        }
        
        // Log history if state changed
        if (oldState !== estado) {
            await connection.query(
                'INSERT INTO cotizaciones_seguimiento (cot_id, u_id, comentario, estado_anterior, estado_nuevo) VALUES (?, ?, ?, ?, ?)',
                [req.params.id, final_u_id, `Estado cambiado de ${oldState} a ${estado}`, oldState, estado]
            );
        }

        // Auto-update client status if approved
        if (estado === 'aprobado' || estado === 'contratado') {
            await connection.query('UPDATE clientes SET estado = "contratado" WHERE id = ?', [cli_id]);
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.delete('/api/cotizaciones/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cotizaciones WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Encuestas de Satisfacción Multimedia ---
app.post('/api/encuestas', upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    const { 
        cli_id, cot_id, nombre_cliente, rating_general, 
        rating_profesionalismo, rating_calidad, 
        rating_comida, rating_decoracion, rating_personal,
        testimonio, acepta_politicas 
    } = req.body;

    try {
        const foto_path = req.files['foto'] ? req.files['foto'][0].path.replace(/\\/g, '/') : null;
        const audio_path = req.files['audio'] ? req.files['audio'][0].path.replace(/\\/g, '/') : null;

        // Obtener título del evento para el testimonio
        let eventTitle = 'Evento Especial';
        if (cot_id) {
            const [cots] = await db.query('SELECT tipo_evento FROM cotizaciones WHERE id = ?', [cot_id]);
            if (cots.length > 0) eventTitle = cots[0].tipo_evento;
        }

        const [result] = await db.query(`
            INSERT INTO encuestas_satisfaccion 
            (cli_id, cot_id, nombre_cliente, titulo_evento, rating_general, rating_profesionalismo, rating_calidad, rating_comida, rating_decoracion, rating_personal, testimonio, foto_path, audio_path, acepta_politicas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            cli_id || null, cot_id || null, nombre_cliente, eventTitle,
            rating_general, rating_profesionalismo, rating_calidad, 
            rating_comida || null, rating_decoracion || null, rating_personal || null,
            testimonio, foto_path, audio_path, acepta_politicas === 'true' || acepta_politicas === 1 || acepta_politicas === '1'
        ]);

        // Notificar al administrador
        const { notifyNewSurvey } = require('./services/notificationService');
        notifyNewSurvey({
            cliente: nombre_cliente,
            rating: rating_general,
            testimonio
        });

        res.json({ success: true, message: 'Encuesta recibida con éxito', id: result.insertId });
    } catch (err) {
        console.error('[Encuestas] Error:', err);
        res.status(500).json({ error: 'Error al procesar la encuesta' });
    }
});

// NUEVO: Listar encuestas para administración (moderación)
app.get('/api/admin/encuestas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM encuestas_satisfaccion ORDER BY fecha DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NUEVO: Actualizar visibilidad y datos de la encuesta
app.put('/api/admin/encuestas/:id', upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const { testimonio, titulo_evento, es_visible } = req.body;
    let foto_path = req.body.foto_path; // Mantener la existente por defecto

    if (req.file) {
        foto_path = `uploads/surveys/${req.file.filename}`.replace(/\\/g, '/');
    }

    try {
        await db.query(
            'UPDATE encuestas_satisfaccion SET testimonio = ?, titulo_evento = ?, es_visible = ?, foto_path = ? WHERE id = ?',
            [testimonio, titulo_evento, es_visible, foto_path, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Utilidades de Automatización de CRM ---
app.put('/api/clientes/:id/status', async (req, res) => {
    const { estado } = req.body;
    try {
        await db.query('UPDATE clientes SET estado = ? WHERE id = ?', [estado, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// RUTAS DE PLANTILLAS
// ==========================================
app.get('/api/plantillas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM plantillas ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/plantillas/:id', async (req, res) => {
    try {
        const [pla] = await db.query('SELECT * FROM plantillas WHERE id = ?', [req.params.id]);
        if (pla.length === 0) return res.status(404).json({ error: 'Plantilla no encontrada' });
        
        const [detalles] = await db.query(`
            SELECT d.*, a.nombre, a.precio_u, a.costo_u, a.categoria, a.nota, l.nombre as loc_nombre, l.precio as loc_precio
            FROM plantilla_detalles d
            LEFT JOIN articulos a ON d.art_id = a.id
            LEFT JOIN locaciones l ON d.loc_id = l.id
            WHERE d.pla_id = ?
        `, [req.params.id]);
        
        res.json({ ...pla[0], detalles });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/plantillas', async (req, res) => {
    const { nombre, tipo_evento, detalles } = req.body;
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.query('INSERT INTO plantillas (nombre, tipo_evento) VALUES (?, ?)', [nombre, tipo_evento]);
        const pla_id = result.insertId;
        if (detalles && detalles.length > 0) {
            const detailValues = detalles.map(d => [pla_id, d.art_id || null, d.loc_id || null, d.cantidad || 1, d.por_persona ? 1 : 0]);
            await connection.query('INSERT INTO plantilla_detalles (pla_id, art_id, loc_id, cantidad, por_persona) VALUES ?', [detailValues]);
        }
        await connection.commit();
        res.json({ success: true, id: pla_id });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.put('/api/plantillas/:id', async (req, res) => {
    const { nombre, tipo_evento, detalles } = req.body;
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        await connection.query('UPDATE plantillas SET nombre=?, tipo_evento=? WHERE id=?', [nombre, tipo_evento, req.params.id]);
        await connection.query('DELETE FROM plantilla_detalles WHERE pla_id = ?', [req.params.id]);
        if (detalles && detalles.length > 0) {
            const detailValues = detalles.map(d => [req.params.id, d.art_id || null, d.loc_id || null, d.cantidad || 1, d.por_persona ? 1 : 0]);
            await connection.query('INSERT INTO plantilla_detalles (pla_id, art_id, loc_id, cantidad, por_persona) VALUES ?', [detailValues]);
        }
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.delete('/api/plantillas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM plantillas WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// CONFIGURACION Y BRANDING (Multi-Sede)
// ==========================================

// Get current active config
app.get('/api/config', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM configuracion WHERE es_activa = 1 LIMIT 1');
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: 'No hay configuración activa.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all configs
app.get('/api/configuraciones', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM configuracion ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific config
app.get('/api/configuraciones/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM configuracion WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: 'Configuración no encontrada.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update specific config (ID-based)
app.put('/api/configuraciones/:id', async (req, res) => {
    const { 
        nombre_empresa, email_contacto, telefono, city, politicas_cotizacion, 
        ig_url, fb_url, tt_url, li_url, x_url, web_url, ceo,
        color_primario, color_secundario, color_terciario, color_fondo,
        novedades_intro 
    } = req.body;
    
    try {
        await db.query(`
            UPDATE configuracion SET 
            nombre_empresa=?, email_contacto=?, telefono=?, city=?, politicas_cotizacion=?, 
            ig_url=?, fb_url=?, tt_url=?, li_url=?, x_url=?, web_url=?, ceo=?,
            color_primario=?, color_secundario=?, color_terciario=?, color_fondo=?,
            novedades_intro=?
            WHERE id=?
        `, [
            nombre_empresa, email_contacto, telefono, city, politicas_cotizacion, 
            ig_url, fb_url, tt_url, li_url, x_url, web_url, ceo,
            color_primario, color_secundario, color_terciario, color_fondo,
            novedades_intro, req.params.id
        ]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update Active Config (Direct Shortcut)
app.put('/api/config', async (req, res) => {
    const { 
        nombre_empresa, email_contacto, telefono, city, politicas_cotizacion, 
        ig_url, fb_url, tt_url, li_url, x_url, web_url, ceo,
        color_primario, color_secundario, color_terciario, color_fondo,
        novedades_intro 
    } = req.body;
    
    try {
        await db.query(`
            UPDATE configuracion SET 
            nombre_empresa=?, email_contacto=?, telefono=?, city=?, politicas_cotizacion=?, 
            ig_url=?, fb_url=?, tt_url=?, li_url=?, x_url=?, web_url=?, ceo=?,
            color_primario=?, color_secundario=?, color_terciario=?, color_fondo=?,
            novedades_intro=?
            WHERE es_activa = 1
        `, [
            nombre_empresa, email_contacto, telefono, city, politicas_cotizacion, 
            ig_url, fb_url, tt_url, li_url, x_url, web_url, ceo,
            color_primario, color_secundario, color_terciario, color_fondo,
            novedades_intro
        ]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Handle Logo Uploads (Multipath)
app.put('/api/config/logo', upload.single('logo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No hay archivo.' });
    const { type, id } = req.body; 
    const isHorizontal = type === 'horizontal';
    const filePath = `/uploads/company/${req.file.filename}`;
    const dbField = isHorizontal ? 'logo_horizontal_path' : 'logo_cuadrado_path';

    try {
        if (id) {
            await db.query(`UPDATE configuracion SET ${dbField} = ? WHERE id = ?`, [filePath, id]);
        } else {
            await db.query(`UPDATE configuracion SET ${dbField} = ? WHERE es_activa = 1`, [filePath]);
        }
        res.json({ success: true, path: filePath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activate specific company
app.put('/api/configuraciones/:id/activar', async (req, res) => {
    try {
        await db.query('UPDATE configuracion SET es_activa = 0');
        await db.query('UPDATE configuracion SET es_activa = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unified Search (Articulos + Locaciones)
app.get('/api/recursos-unificados', async (req, res) => {
    try {
        const [art] = await db.query(`
            SELECT a.id as art_id, NULL as loc_id, a.nombre, a.categoria, a.precio_u, a.costo_u, a.foto, 
                   "articulo" as tipo, COALESCE(p.nombre, 'ArchiPlanner') as nombre_proveedor
            FROM articulos a
            LEFT JOIN proveedores p ON a.pro_id = p.id
        `);
        const [loc] = await db.query('SELECT NULL as art_id, id as loc_id, nombre, tipo as categoria, precio as precio_u, 0 as costo_u, foto, "locacion" as tipo, "ArchiPlanner" as nombre_proveedor FROM locaciones');
        res.json([...art, ...loc]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('ArchiPlanner API - Onyx & Rose Edition');
});

// Quotation History / Tracking
app.get('/api/cotizaciones/:id/historial', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT h.*, u.nombre as usuario_nombre 
            FROM cotizaciones_seguimiento h
            LEFT JOIN usuarios u ON h.u_id = u.id
            WHERE h.cot_id = ?
            ORDER BY h.fecha DESC
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint de Timeline Unificado (Actividades + Historial)
app.get('/api/cotizaciones/:id/timeline', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener Historial de Seguimiento
        const [historial] = await db.query(`
            SELECT 
                h.id, 
                h.fecha, 
                h.tipo, 
                h.comentario as mensaje, 
                h.estado_nuevo, 
                h.estado_anterior,
                u.nombre as usuario,
                'log' as fuente
            FROM cotizaciones_seguimiento h
            LEFT JOIN usuarios u ON h.u_id = u.id
            WHERE h.cot_id = ?
        `, [id]);

        // 2. Obtener Actividades (Reuniones, Citas, etc.)
        const [actividades] = await db.query(`
            SELECT 
                a.id, 
                a.fecha_inicio as fecha, 
                a.tipo, 
                a.titulo as mensaje, 
                NULL as estado_nuevo, 
                NULL as estado_anterior,
                'Calendario' as usuario,
                'actividad' as fuente
            FROM actividades a
            WHERE a.cot_id = ?
        `, [id]);

        // Combinar y ordenar
        const timeline = [...historial, ...actividades].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        res.json(timeline);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cotizaciones/:id/historial', async (req, res) => {
    const { id } = req.params;
    const { u_id, comentario, tipo, estado_nuevo, estado_anterior } = req.body;
    try {
        await db.query(
            'INSERT INTO cotizaciones_seguimiento (cot_id, u_id, tipo, comentario, estado_nuevo, estado_anterior) VALUES (?, ?, ?, ?, ?, ?)',
            [id, u_id, tipo || 'comentario', comentario, estado_nuevo || null, estado_anterior || null]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// TESTIMONIOS (CRUD)
// ==========================================

// Get all testimonials (Admin)
app.get('/api/admin/testimonials', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM testimonios ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get visible testimonials (Public Web)
app.get('/api/testimonials', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM testimonios WHERE es_visible = 1 ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/testimonials', upload.single('image'), async (req, res) => {
    const { name, event_title, message, es_visible } = req.body;
    const image = req.file ? `/uploads/testimonials/${req.file.filename}` : null;
    try {
        const [result] = await db.query(
            'INSERT INTO testimonios (image, message, name, event_title, es_visible) VALUES (?, ?, ?, ?, ?)',
            [image, message, name, event_title, es_visible || 1]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/testimonials/:id', upload.single('image'), async (req, res) => {
    const { name, event_title, message, es_visible } = req.body;
    let image = req.body.image_path || req.body.image;
    if (req.file) {
        image = `/uploads/testimonials/${req.file.filename}`;
    }
    try {
        await db.query(
            'UPDATE testimonios SET image=?, message=?, name=?, event_title=?, es_visible=? WHERE id=?',
            [image, message, name, event_title, es_visible, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT image FROM testimonios WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].image && !rows[0].image.startsWith('/images/')) {
            const filePath = path.join(__dirname, '..', rows[0].image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await db.query('DELETE FROM testimonios WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// CONTENIDO WEB (CMS)
// ==========================================

app.get('/api/web-content/:pagina', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT seccion, clave, valor FROM web_contenido WHERE pagina = ?', [req.params.pagina]);
        const contentMap = {};
        rows.forEach(row => {
            contentMap[`${row.seccion}_${row.clave}`] = row.valor;
        });
        res.json(contentMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/web-content', async (req, res) => {
    const { pagina, contents } = req.body;
    try {
        for (const item of contents) {
            await db.query(
                'UPDATE web_contenido SET valor = ? WHERE pagina = ? AND seccion = ? AND clave = ?',
                [item.valor, pagina, item.seccion, item.clave]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Borrado aquí para moverlo arriba

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API ArchiPlanner corriendo en http://0.0.0.0:${PORT}`);
});

