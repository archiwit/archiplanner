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


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes - Pagos & Gastos
const pagosRoutes = require('./routes/pagos');
const gastosRoutes = require('./routes/gastos');
app.use('/api/pagos', pagosRoutes);
app.use('/api/gastos', gastosRoutes);

app.use('/api/servicios', serviciosRoutes);
app.use('/api', cmsWebRoutes);
app.use('/api/paginas-v4', paginasV4Routes);


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

app.put('/api/config', upload.fields([{ name: 'logo_cuadrado', maxCount: 1 }, { name: 'logo_horizontal', maxCount: 1 }]), async (req, res) => {
    const { nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, color_primario, color_secundario, color_terciario, color_fondo, ceo, tt_url, li_url, x_url, web_url } = req.body;
    try {
        const [activeConfig] = await db.query('SELECT id, logo_cuadrado_path, logo_horizontal_path FROM configuracion WHERE es_activa = 1 LIMIT 1');
        const configId = activeConfig.length > 0 ? activeConfig[0].id : null;
        if (!configId) return res.status(404).json({ error: 'No hay configuración activa' });
        let lcp = req.body.logo_cuadrado_path || activeConfig[0].logo_cuadrado_path;
        let lhp = req.body.logo_horizontal_path || activeConfig[0].logo_horizontal_path;
        if (req.files) {
            if (req.files.logo_cuadrado) lcp = `/uploads/config/${req.files.logo_cuadrado[0].filename}`;
            if (req.files.logo_horizontal) lhp = `/uploads/config/${req.files.logo_horizontal[0].filename}`;
        }
        await db.query(`UPDATE configuracion SET nombre_empresa=?, email_contacto=?, telefono=?, city=?, ig_url=?, fb_url=?, pn_url=?, logo_cuadrado_path=?, logo_horizontal_path=?, color_primario=?, color_secundario=?, color_terciario=?, color_fondo=?, ceo=?, tt_url=?, li_url=?, x_url=?, web_url=? WHERE id=?`, [nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, lcp, lhp, color_primario, color_secundario, color_terciario, color_fondo, ceo, tt_url, li_url, x_url, web_url, configId]);
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

app.post('/api/configuraciones', upload.fields([{ name: 'logo_cuadrado', maxCount: 1 }, { name: 'logo_horizontal', maxCount: 1 }]), async (req, res) => {
    const { nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, color_primario, color_secundario, color_terciario, color_fondo, intro_cotizacion, politicas_cotizacion, ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion } = req.body;
    let lcp = null, lhp = null;
    if (req.files) {
        if (req.files.logo_cuadrado) lcp = `/uploads/config/${req.files.logo_cuadrado[0].filename}`;
        if (req.files.logo_horizontal) lhp = `/uploads/config/${req.files.logo_horizontal[0].filename}`;
    }
    try {
        const [result] = await db.query(`INSERT INTO configuracion (nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, logo_cuadrado_path, logo_horizontal_path, color_primario, color_secundario, color_terciario, color_fondo, intro_cotizacion, politicas_cotizacion, ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, lcp, lhp, color_primario, color_secundario, color_terciario, color_fondo, intro_cotizacion, politicas_cotizacion, ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion]);
        res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/configuraciones/:id', upload.fields([{ name: 'logo_cuadrado', maxCount: 1 }, { name: 'logo_horizontal', maxCount: 1 }]), async (req, res) => {
    const { 
        nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, 
        color_primario, color_secundario, color_terciario, color_fondo, 
        intro_cotizacion, politicas_cotizacion, 
        ceo, tt_url, li_url, x_url, web_url, cedula, ciudad_expedicion 
    } = req.body;
    
    let logo_cuadrado_path = req.body.logo_cuadrado_path;
    let logo_horizontal_path = req.body.logo_horizontal_path;

    if (req.files) {
        if (req.files.logo_cuadrado) logo_cuadrado_path = `/uploads/config/${req.files.logo_cuadrado[0].filename}`;
        if (req.files.logo_horizontal) logo_horizontal_path = `/uploads/config/${req.files.logo_horizontal[0].filename}`;
    }
    
    try {
        await db.query(`
            UPDATE configuracion SET 
            nombre_empresa = ?, email_contacto = ?, telefono = ?, city = ?, ig_url = ?, fb_url = ?, pn_url = ?, 
            logo_cuadrado_path = ?, logo_horizontal_path = ?,
            color_primario = ?, color_secundario = ?, color_terciario = ?, color_fondo = ?,
            intro_cotizacion = ?, politicas_cotizacion = ?,
            ceo = ?, tt_url = ?, li_url = ?, x_url = ?, web_url = ?,
            cedula = ?, ciudad_expedicion = ?
            WHERE id = ?
        `, [
            nombre_empresa, email_contacto, telefono, city, ig_url, fb_url, pn_url, 
            logo_cuadrado_path, logo_horizontal_path,
            color_primario, color_secundario, color_terciario, color_fondo,
            intro_cotizacion, politicas_cotizacion,
            ceo, tt_url, li_url, x_url, web_url,
            cedula, ciudad_expedicion,
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

// Routes - Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [clientes] = await db.query('SELECT COUNT(*) as count FROM clientes');
        const [cotizaciones] = await db.query('SELECT COUNT(*) as count FROM cotizaciones');
        const [articulos] = await db.query('SELECT COUNT(*) as count FROM articulos');
        res.json({
            clientes: clientes[0].count,
            cotizaciones: cotizaciones[0].count,
            servicios: articulos[0].count,
            pendientes: 3
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes - Usuarios (User Management)
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.nombre, u.nick, u.correo, u.telefono, u.direccion, u.rol, u.estado, u.u_ultima_sesion, u.conf_id, u.foto, c.nombre_empresa 
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
    const { nombre, nick, clave, correo, telefono, direccion, rol, conf_id, estado } = req.body;
    const foto = req.file ? `/uploads/users/${req.file.filename}` : null;
    
    try {
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, nick, clave, correo, telefono, direccion, rol, conf_id, foto, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, nick, clave, correo, telefono, direccion, rol, conf_id || 1, foto, estado === 'Activos' || estado === 'Activo' || estado === 'true' || estado === 1 ? 1 : 0]
        );
        res.json({ success: true, id: result.insertId, foto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/usuarios/:id', upload.single('foto'), async (req, res) => {
    const { nombre, nick, clave, correo, telefono, direccion, rol, conf_id, estado } = req.body;

    let foto = req.body.foto_path || req.body.foto;
    if (foto === 'undefined' || foto === 'null') foto = null;
    if (req.file) {
        foto = `/uploads/users/${req.file.filename}`;
    }
    
    try {
        const isActivo = (estado === 'Activo' || estado === 'true' || estado === 1 || estado === '1') ? 1 : 0;
        if (clave && clave.length > 0) {
            await db.query(
                'UPDATE usuarios SET nombre=?, nick=?, clave=?, correo=?, telefono=?, direccion=?, rol=?, conf_id=?, foto=?, estado=? WHERE id=?',
                [nombre, nick, clave, correo, telefono, direccion, rol, conf_id || 1, foto, isActivo, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre=?, nick=?, correo=?, telefono=?, direccion=?, rol=?, conf_id=?, foto=?, estado=? WHERE id=?',
                [nombre, nick, correo, telefono, direccion, rol, conf_id || 1, foto, isActivo, req.params.id]
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

// Auth Route
app.post('/api/auth/login', async (req, res) => {
    const { nick, clave } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE nick = ? AND clave = ?', [nick, clave]);
        if (rows.length > 0) {
            const user = rows[0];
            res.json({
                success: true,
                user: { id: user.id, nombre: user.nombre, rol: user.rol, conf_id: user.conf_id, foto: user.foto },
                token: 'simulated_jwt_token_for_now'
            });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
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
                estado || 'prospecto', u_id || null, finalConfId, notas, foto
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
        const IG_USER_ID = process.env.IG_USER_ID;
        const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

        if (!IG_USER_ID || !ACCESS_TOKEN) {
            // Mock data if no credentials to avoid breaking the UI
            return res.json([
                { id: '1', media_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400', permalink: '#', caption: 'Luxury Event 1' },
                { id: '2', media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400', permalink: '#', caption: 'Luxury Event 2' },
                { id: '3', media_url: 'https://images.unsplash.com/photo-1544074216-0e96f131a61c?q=80&w=400', permalink: '#', caption: 'Luxury Event 3' }
            ]);
        }

        const url = `https://graph.facebook.com/v20.0/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=10&access_token=${ACCESS_TOKEN}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        res.json(data.data || []);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar Instagram' });
    }
});

// ==========================================
// RUTAS DE COTIZACIONES
// ==========================================
app.get('/api/cotizaciones', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, cl.nombre as cliente_nombre, cl.apellido as cliente_apellido, u.nombre as usuario_nombre,
                   cf.nombre_empresa, cf.logo_cuadrado_path as logo_empresa,
                   cl.conf_id as client_conf_id
            FROM cotizaciones c
            LEFT JOIN clientes cl ON c.cli_id = cl.id
            LEFT JOIN usuarios u ON c.u_id = u.id
            LEFT JOIN configuracion cf ON COALESCE(cl.conf_id, c.conf_id) = cf.id
            ORDER BY c.id DESC
        `);
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
        
        // Prioritize client's company, fallback to quotation's company
        const finalConfId = (cliente[0] && cliente[0].conf_id) ? cliente[0].conf_id : coti[0].conf_id;
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
        estado, notas, detalles 
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [result] = await connection.query(`
            INSERT INTO cotizaciones 
            (conf_id, num, cli_id, u_id, fcoti, fevent, fevent_fin, num_adultos, num_ninos, hora_inicio, hora_fin, lugar, loc_id, tematica, tipo_evento, paleta_colores, subt, iva, aplica_iva, mostrar_precios, total, total_tipo, monto_final, estado, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [conf_id || 1, num, cli_id, u_id, fcoti, fevent, fevent_fin || fevent, num_adultos, num_ninos, hora_inicio, hora_fin, lugar, loc_id || null, tematica, tipo_evento, paleta_colores, subt || 0, iva || 0, aplica_iva ? 1 : 0, mostrar_precios ? 1 : 0, total || 0, total_tipo || 'calculado', monto_final || 0, estado || 'borrador', notas || '']);
        
        const cot_id = result.insertId;

        if (detalles && detalles.length > 0) {
            const detailValues = detalles.map(d => [
                cot_id, d.art_id || null, d.loc_id || null, d.cantidad || 1, d.costo_u || 0, d.precio_u || 0, d.subtotal || 0, d.notas || '', d.por_persona ? 1 : 0
            ]);
            await connection.query(`
                INSERT INTO cotizacion_detalles (cot_id, art_id, loc_id, cantidad, costo_u, precio_u, subtotal, notas, por_persona)
                VALUES ?
            `, [detailValues]);
        }

        // Log initial creation
        await connection.query(
            'INSERT INTO cotizaciones_seguimiento (cot_id, u_id, comentario, estado_nuevo) VALUES (?, ?, ?, ?)',
            [cot_id, u_id, 'Cotización creada', estado || 'borrador']
        );

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
        // Check for state change to log it
        const [oldStateRow] = await connection.query('SELECT estado FROM cotizaciones WHERE id = ?', [req.params.id]);
        const oldState = oldStateRow.length > 0 ? oldStateRow[0].estado : null;

        await connection.query(`
            UPDATE cotizaciones SET
            conf_id=?, num=?, cli_id=?, u_id=?, fcoti=?, fevent=?, fevent_fin=?, num_adultos=?, num_ninos=?, 
            hora_inicio=?, hora_fin=?, lugar=?, loc_id=?, tematica=?, tipo_evento=?, 
            paleta_colores=?, subt=?, iva=?, aplica_iva=?, mostrar_precios=?, total=?, total_tipo=?, monto_final=?, 
            estado=?, notas=?
            WHERE id=?
        `, [conf_id || 1, num, cli_id, u_id, fcoti, fevent, fevent_fin || fevent, num_adultos, num_ninos, hora_inicio, hora_fin, lugar, loc_id || null, tematica, tipo_evento, paleta_colores, subt || 0, iva || 0, aplica_iva ? 1 : 0, mostrar_precios ? 1 : 0, total || 0, total_tipo || 'calculado', monto_final || 0, estado || 'borrador', notas || '', req.params.id]);

        // Delete old details and insert new ones
        await connection.query('DELETE FROM cotizacion_detalles WHERE cot_id = ?', [req.params.id]);

        if (detalles && detalles.length > 0) {
            const detailValues = detalles.map(d => [
                req.params.id, d.art_id || null, d.loc_id || null, d.cantidad || 1, d.costo_u || 0, d.precio_u || 0, d.subtotal || 0, d.notas || '', d.por_persona ? 1 : 0
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
                [req.params.id, u_id, `Estado cambiado de ${oldState} a ${estado}`, oldState, estado]
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

app.post('/api/cotizaciones/:id/historial', async (req, res) => {
    const { id } = req.params;
    const { u_id, comentario, estado_nuevo, estado_anterior } = req.body;
    try {
        await db.query(
            'INSERT INTO cotizaciones_seguimiento (cot_id, u_id, comentario, estado_nuevo, estado_anterior) VALUES (?, ?, ?, ?, ?)',
            [id, u_id, comentario, estado_nuevo || null, estado_anterior || null]
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

app.listen(PORT, () => {
    console.log(`🚀 API ArchiPlanner corriendo en http://localhost:${PORT}`);
});
