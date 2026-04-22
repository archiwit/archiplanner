const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Gallery
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/gallery');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadGallery = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// List all pages
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, slug, descripcion, created_at, is_visible, is_homepage, seo_title, seo_description, seo_keywords FROM web_paginas_v4 ORDER BY created_at DESC');
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MEDIA ROUTES (Must be BEFORE dynamic routes) ---

// Get all available media (for the builder gallery)
router.get('/media', async (req, res) => {
    try {
        const { categoria, limit = 24, offset = 0 } = req.query;
        let query = 'SELECT * FROM web_galeria_media';
        const params = [];

        if (categoria && categoria !== 'todas') {
            query += ' WHERE categoria = ?';
            params.push(categoria);
        }

        if (req.query.tipo && req.query.tipo !== 'todos') {
            query += query.includes('WHERE') ? ' AND tipo = ?' : ' WHERE tipo = ?';
            params.push(req.query.tipo);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync existing images from Articles and Services
router.post('/media/sync', async (req, res) => {
    try {
        // Helper to detect type
        const getTipo = (url) => {
            if (!url) return 'imagen';
            const ext = path.extname(url).toLowerCase();
            if (['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext)) return 'video';
            return 'imagen';
        };

        // 1. Get current gallery URLs to avoid duplicates
        const [galeria] = await db.query('SELECT url FROM web_galeria_media');
        const galeriaUrls = new Set(galeria.map(g => g.url));

        let inserted = 0;

        // 2. Sync From Articulos (Productos)
        const [articulos] = await db.query('SELECT DISTINCT foto, nombre FROM articulos WHERE foto IS NOT NULL AND foto != ""');
        for (const item of articulos) {
            if (item.foto && !galeriaUrls.has(item.foto)) {
                await db.query(
                    'INSERT INTO web_galeria_media (url, tipo, name, categoria, created_at) VALUES (?, ?, ?, ?, NOW())',
                    [item.foto, getTipo(item.foto), item.nombre, 'productos']
                );
                inserted++;
            }
        }

        // 3. Sync From Web Historias (Sistema / Videos)
        const [historias] = await db.query('SELECT DISTINCT url, titulo FROM web_historias WHERE url IS NOT NULL AND url != ""');
        for (const story of historias) {
            if (story.url && !galeriaUrls.has(story.url)) {
                await db.query(
                    'INSERT INTO web_galeria_media (url, tipo, name, categoria, created_at) VALUES (?, ?, ?, ?, NOW())',
                    [story.url, getTipo(story.url), story.titulo, 'sistema']
                );
                inserted++;
            }
        }

        // 4. Sync From Web Galeria Eventos (Eventos / Portadas)
        const [eventos] = await db.query('SELECT DISTINCT portada_url, titulo FROM web_galeria_eventos WHERE portada_url IS NOT NULL AND portada_url != ""');
        for (const ev of eventos) {
            if (ev.portada_url && !galeriaUrls.has(ev.portada_url)) {
                await db.query(
                    'INSERT INTO web_galeria_media (url, tipo, name, categoria, created_at) VALUES (?, ?, ?, ?, NOW())',
                    [ev.portada_url, getTipo(ev.portada_url), ev.titulo, 'eventos']
                );
                inserted++;
            }
        }

        res.json({ success: true, message: `Sincronización completada. ${inserted} nuevos recursos añadidos.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload media to gallery
router.post('/media/upload', uploadGallery.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

        const url = `/uploads/gallery/${req.file.filename}`;
        const name = req.body.name || req.file.originalname;
        const tipo = req.file.mimetype.startsWith('video') ? 'video' : 'imagen';
        const categoria = req.body.categoria || 'galeria';

        const [result] = await db.query(
            'INSERT INTO web_galeria_media (url, tipo, name, categoria, created_at) VALUES (?, ?, ?, ?, NOW())',
            [url, tipo, name, categoria]
        );

        res.json({ 
            success: true, 
            id: result.insertId, 
            url,
            tipo,
            name 
        });
    } catch (err) {
        console.error('[UPLOAD ERROR]:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Set page as homepage
router.post('/set-homepage/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // Remove homepage flag from all pages
        await connection.query('UPDATE web_paginas_v4 SET is_homepage = 0');
        // Set new homepage
        await connection.query('UPDATE web_paginas_v4 SET is_homepage = 1 WHERE id = ?', [req.params.id]);
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Get single page (by ID or Slug)
router.get('/:idOrSlug', async (req, res) => {
    const { idOrSlug } = req.params;
    try {
        let query = 'SELECT * FROM web_paginas_v4 WHERE id = ?';
        let param = idOrSlug;

        if (idOrSlug === 'homepage_v4') {
            query = 'SELECT * FROM web_paginas_v4 WHERE is_homepage = 1 LIMIT 1';
            param = null;
        } else if (isNaN(idOrSlug)) {
            query = 'SELECT * FROM web_paginas_v4 WHERE slug = ?';
        }
        
        const [rows] = await db.query(query, param ? [param] : []);
        if (rows.length === 0) return res.status(404).json({ error: 'Página no encontrada' });
        
        // Parse JSON fields
        const page = rows[0];
        try {
            if (page.content && typeof page.content === 'string') page.content = JSON.parse(page.content);
            if (page.style_config && typeof page.style_config === 'string') page.style_config = JSON.parse(page.style_config);
        } catch (e) { console.error("Error parsing JSON for page", idOrSlug); }
        
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new page
router.post('/', async (req, res) => {
    const { nombre, slug, descripcion, created_by } = req.body;
    if (!nombre || !slug) return res.status(400).json({ error: 'Nombre y Slug son requeridos' });
    
    try {
        const [result] = await db.query(
            'INSERT INTO web_paginas_v4 (nombre, slug, descripcion, created_by, content, style_config, seo_title, seo_description, seo_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, slug, descripcion, created_by || 'Admin', '[]', '{}', req.body.seo_title || nombre, req.body.seo_description || descripcion, req.body.seo_keywords || '']
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El slug ya existe' });
        res.status(500).json({ error: err.message });
    }
});

// Contact / Lead Capture
router.post('/contact', async (req, res) => {
    const { nombre, correo, telefono, mensaje, pagina_origen } = req.body;
    
    try {
        // 1. Save to web_mensajes (Redundancy)
        await db.query(
            'INSERT INTO web_mensajes (nombre, correo, telefono, mensaje, pagina_origen) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, telefono, mensaje, pagina_origen || 'V4 Builder Site']
        );

        // 2. Create Lead in 'clientes' table
        // We set status to 'prospecto' as requested, and es_nuevo = 1
        const [result] = await db.query(
            `INSERT INTO clientes (nombre, correo, telefono, notas, estado, es_nuevo, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [nombre, correo, telefono, `Mensaje desde web: ${mensaje}`, 'prospecto', 1]
        );

        // 3. Email Notification (Nodemailer)
        try {
            const [configRows] = await db.query('SELECT email_contacto, nombre_empresa FROM configuracion WHERE es_activa = 1 LIMIT 1');
            if (configRows.length > 0) {
                const config = configRows[0];
                const transporter = nodemailer.createTransport({
                    // Basic fallback, ideally user should configure SMTP in .env
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: `"ArchiPlanner Web" <${process.env.EMAIL_USER}>`,
                    to: config.email_contacto,
                    subject: `🚀 Nuevo Lead: ${nombre} - ArchiPlanner`,
                    html: `
                        <h2>Tienes un nuevo mensaje desde tu sitio web</h2>
                        <p><strong>Nombre:</strong> ${nombre}</p>
                        <p><strong>Correo:</strong> ${correo}</p>
                        <p><strong>Teléfono:</strong> ${telefono}</p>
                        <p><strong>Mensaje:</strong> ${mensaje}</p>
                        <hr/>
                        <p>Este lead ha sido registrado automáticamente en tu panel administrativo como 'Prospecto Nuevo' pendiente de contactar.</p>
                    `
                };

                // await transporter.sendMail(mailOptions); // Uncomment when transport is configured
                console.log("Email notification would be sent to:", config.email_contacto);
            }
        } catch (mailErr) {
            console.error("Error sending lead email notification:", mailErr.message);
        }

        res.json({ success: true, message: 'Mensaje enviado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { nombre, slug, descripcion, is_visible, estado, content, style_config, seo_title, seo_description, seo_keywords, is_homepage } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if (Number(is_homepage) === 1) {
            await connection.query('UPDATE web_paginas_v4 SET is_homepage = 0');
        }

        await connection.query(
            'UPDATE web_paginas_v4 SET nombre = ?, slug = ?, descripcion = ?, is_visible = ?, estado = ?, content = ?, style_config = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, is_homepage = ? WHERE id = ?',
            [
                nombre, 
                slug, 
                descripcion, 
                is_visible, 
                estado, 
                typeof content === 'string' ? content : JSON.stringify(content), 
                typeof style_config === 'string' ? style_config : JSON.stringify(style_config),
                seo_title,
                seo_description,
                seo_keywords,
                is_homepage || 0,
                req.params.id
            ]
        );
        
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ... (Rest of the duplicate/delete routes)

// Duplicate page
router.post('/:id/duplicate', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM web_paginas_v4 WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Página original no encontrada' });
        
        const original = rows[0];
        const newSlug = `${original.slug}-copy-${Date.now()}`;
        const newNombre = `${original.nombre} (Copia)`;
        
        const [result] = await db.query(
            'INSERT INTO web_paginas_v4 (nombre, slug, descripcion, created_by, is_visible, estado, content, style_config) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newNombre, newSlug, original.descripcion, original.created_by, 0, 'borrador', original.content, original.style_config]
        );
        
        res.json({ success: true, id: result.insertId, slug: newSlug });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete page
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM web_paginas_v4 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
