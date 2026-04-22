const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const { deleteFiles } = require('../utils/fileManager');

// Helper para asegurar estructura de tabla
const ensureGallerySchema = async () => {
    const columns = [
        ['en_hero', 'TINYINT(1) DEFAULT 0'],
        ['narrativa', 'TEXT'],
        ['metadata', 'JSON'],
        ['activo', 'TINYINT(1) DEFAULT 1'],
        ['orden', 'INT DEFAULT 0']
    ];
    for (const [name, type] of columns) {
        try {
            await db.query(`ALTER TABLE web_galeria_eventos ADD COLUMN ${name} ${type}`);
        } catch (e) {}
    }
};

// --- CTAS ---
router.get('/ctas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM web_ctas ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/ctas', upload.single('imagen'), async (req, res) => {
    const { slug, tag, titulo, descripcion, texto_boton, enlace } = req.body;
    const imagen = req.file ? `/uploads/services/${req.file.filename}` : null;
    
    try {
        const [result] = await db.query(
            'INSERT INTO web_ctas (slug, tag, titulo, descripcion, texto_boton, enlace, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [slug, tag, titulo, descripcion, texto_boton, enlace, imagen]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/ctas/:id', upload.single('imagen'), async (req, res) => {
    const { slug, tag, titulo, descripcion, texto_boton, enlace, imagen_path } = req.body;
    let imagen = imagen_path;

    if (req.file) {
        try {
            const [oldCta] = await db.query('SELECT imagen FROM web_ctas WHERE id = ?', [req.params.id]);
            if (oldCta.length > 0 && oldCta[0].imagen) deleteFiles(oldCta[0].imagen);
        } catch (e) { console.error('Error deleting old CTA image:', e); }
        imagen = `/uploads/services/${req.file.filename}`;
    }

    try {
        await db.query(
            'UPDATE web_ctas SET slug = ?, tag = ?, titulo = ?, descripcion = ?, texto_boton = ?, enlace = ?, imagen = ? WHERE id = ?',
            [slug, tag, titulo, descripcion, texto_boton, enlace, imagen, req.params.id]
        );
        res.json({ success: true, imagen });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- PAGINAS ---
router.post('/paginas', async (req, res) => {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug is required' });
    try {
        // Al insertar una sección marcada con esa página, aparecerá en el SELECT DISTINCT
        await db.query(
            'INSERT INTO web_secciones (pagina, tipo, orden, activo, metadata) VALUES (?, ?, ?, ?, ?)',
            [slug, 'PAGE_HEADER', 0, 1, JSON.stringify({ titulo: `Página ${slug}` })]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/paginas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT pagina FROM web_secciones ORDER BY pagina ASC');
        const pages = rows.map(r => r.pagina);
        // Asegurar que al menos home existe
        if (!pages.includes('home')) pages.unshift('home');
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/paginas/:nombre', async (req, res) => {
    try {
        await db.query('DELETE FROM web_secciones WHERE pagina = ?', [req.params.nombre]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SECCIONES (ORDEN / CONSTRUCTOR) ---
router.get('/secciones/:pagina', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM web_secciones WHERE pagina = ? ORDER BY orden ASC', [req.params.pagina]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/secciones', upload.single('media_file'), async (req, res) => {
    let { pagina, tipo, orden, activo, metadata } = req.body;
    console.log(`CMS: Guardando nueva sección en página [${pagina}] - Tipo: ${tipo}`);
    
    try {
        let meta = {};
        if (metadata) {
            try {
                meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
            } catch (pErr) {
                console.error('CMS: Error parseando metadata string:', metadata);
                meta = { error: 'Failed to parse', raw: metadata };
            }
        }
        
        if (req.file) {
            meta.media_path = `/uploads/gallery/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO web_secciones (pagina, tipo, orden, activo, metadata) VALUES (?, ?, ?, ?, ?)',
            [pagina, tipo, orden || 0, activo || 1, JSON.stringify(meta)]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/secciones/reorder', async (req, res) => {
    const { pagina, secciones } = req.body; // Array of { id, orden }
    try {
        for (const sec of secciones) {
            await db.query('UPDATE web_secciones SET orden = ? WHERE id = ? AND pagina = ?', [sec.orden, sec.id, pagina]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/secciones/:id', upload.single('media_file'), async (req, res) => {
    let { tipo, metadata, activo, orden } = req.body;
    console.log(`CMS: Actualizando sección [${req.params.id}] - Tipo: ${tipo}`);
    
    try {
        let meta = {};
        if (metadata) {
            try {
                meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
            } catch (pErr) {
                console.error('CMS: Error parseando metadata en PUT:', metadata);
                meta = { error: 'Failed to parse', raw: metadata };
            }
        }

        if (req.file) {
            meta.media_path = `/uploads/gallery/${req.file.filename}`;
        }

        await db.query(
            'UPDATE web_secciones SET tipo = ?, metadata = ?, activo = ?, orden = ? WHERE id = ?',
            [tipo, JSON.stringify(meta), activo, orden, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/secciones/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM web_secciones WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- HISTORIAS (VIDEOS) ---
router.get('/historias', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM web_historias ORDER BY orden ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/historias', upload.single('video'), async (req, res) => {
    const { titulo, orden } = req.body;
    const url = req.file ? `/uploads/stories/${req.file.filename}` : null;
    
    try {
        const [result] = await db.query(
            'INSERT INTO web_historias (url, titulo, orden, activo) VALUES (?, ?, ?, 1)',
            [url, titulo, orden || 0]
        );
        res.json({ success: true, id: result.insertId, url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/historias/:id', upload.single('video'), async (req, res) => {
    const { titulo, url_path, activo, orden } = req.body;
    let url = url_path;

    if (req.file) {
        try {
            const [oldStory] = await db.query('SELECT url FROM web_historias WHERE id = ?', [req.params.id]);
            if (oldStory.length > 0 && oldStory[0].url) deleteFiles(oldStory[0].url);
        } catch (e) { console.error('Error deleting old story video:', e); }
        url = `/uploads/stories/${req.file.filename}`;
    }

    // Convert activo to number if it comes as string from FormData
    const isActive = (activo === 'true' || activo === '1' || activo === 1) ? 1 : 0;

    try {
        await db.query(
            'UPDATE web_historias SET titulo = ?, url = ?, activo = ?, orden = ? WHERE id = ?',
            [titulo, url, isActive, parseInt(orden) || 0, req.params.id]
        );
        res.json({ success: true, url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/historias/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM web_historias WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/historias/reorder', async (req, res) => {
    const { historias } = req.body; // Array of { id, orden }
    try {
        for (const story of historias) {
            await db.query('UPDATE web_historias SET orden = ? WHERE id = ?', [story.orden, story.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GALERIA: CATEGORIAS ---
router.get('/galeria/categorias', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM web_galeria_categorias ORDER BY nombre ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/galeria/categorias', async (req, res) => {
    const { nombre, slug } = req.body;
    try {
        const [result] = await db.query('INSERT INTO web_galeria_categorias (nombre, slug) VALUES (?, ?)', [nombre, slug]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/galeria/categorias/:id', async (req, res) => {
    const { nombre, slug } = req.body;
    try {
        await db.query('UPDATE web_galeria_categorias SET nombre = ?, slug = ? WHERE id = ?', [nombre, slug, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/galeria/categorias/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM web_galeria_categorias WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GALERIA: EVENTOS ---
router.get('/galeria/eventos', async (req, res) => {
    try {
        await ensureGallerySchema();
        const [rows] = await db.query(`
            SELECT e.*, c.nombre as categoria_nombre 
            FROM web_galeria_eventos e 
            LEFT JOIN web_galeria_categorias c ON e.categoria_id = c.id 
            ORDER BY e.orden ASC, e.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/galeria/eventos/:id', async (req, res) => {
    try {
        const [eventos] = await db.query('SELECT * FROM web_galeria_eventos WHERE id = ?', [req.params.id]);
        if (eventos.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
        
        const [media] = await db.query('SELECT * FROM web_galeria_media WHERE evento_id = ? ORDER BY orden ASC', [req.params.id]);
        res.json({ ...eventos[0], media });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/galeria/eventos', upload.single('portada'), async (req, res) => {
    await ensureGallerySchema();
    const { titulo, descripcion, narrativa, categoria_id, orden, en_hero, metadata, portada_url_path } = req.body;
    const isHero = (en_hero === 'true' || en_hero === '1' || en_hero === 1) ? 1 : 0;
    
    // Si viene req.file es prioridad, si no usar lo que venga en el cuerpo
    let portada_url = null;
    if (req.file) {
        portada_url = `/uploads/gallery/${req.file.filename}`;
    } else if (portada_url_path) {
        portada_url = portada_url_path;
    }
    
    // Validar categoria_id para que sea NULL si está vacío
    const final_categoria_id = (categoria_id && categoria_id !== '') ? categoria_id : null;

    try {
        const [result] = await db.query(
            'INSERT INTO web_galeria_eventos (titulo, descripcion, narrativa, categoria_id, portada_url, orden, en_hero, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, descripcion, narrativa, final_categoria_id, portada_url, orden || 0, isHero, metadata || '{}']
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('Error in POST /galeria/eventos:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'La imagen de portada es demasiado pesada (Máx 200MB)' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.put('/galeria/eventos/:id', upload.single('portada'), async (req, res) => {
    await ensureGallerySchema();
    const { titulo, descripcion, narrativa, categoria_id, orden, activo, en_hero, metadata, portada_url_path } = req.body;
    let portada_url = portada_url_path;
    const isHero = (en_hero === 'true' || en_hero === '1' || en_hero === 1) ? 1 : 0;

    if (req.file) {
        // Eliminar portada anterior si existe
        try {
            const [oldRows] = await db.query('SELECT portada_url FROM web_galeria_eventos WHERE id = ?', [req.params.id]);
            if (oldRows.length > 0 && oldRows[0].portada_url) {
                const oldPath = path.join(__dirname, '../../', oldRows[0].portada_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        } catch (err) {
            console.error('Error deleting old portada:', err);
        }
        portada_url = `/uploads/gallery/${req.file.filename}`;
    }

    // Validar categoria_id para que sea NULL si está vacío
    const final_categoria_id = (categoria_id && categoria_id !== '') ? categoria_id : null;

    try {
        await db.query(
            'UPDATE web_galeria_eventos SET titulo = ?, descripcion = ?, narrativa = ?, categoria_id = ?, portada_url = ?, orden = ?, activo = ?, en_hero = ?, metadata = ? WHERE id = ?',
            [titulo, descripcion, narrativa, final_categoria_id, portada_url, orden, activo, isHero, metadata || '{}', req.params.id]
        );
        res.json({ success: true, portada_url });
    } catch (err) {
        console.error('Error in PUT /galeria/eventos/:id:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'La imagen es demasiado pesada (Máx 200MB)' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.delete('/galeria/eventos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM web_galeria_eventos WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GALERIA: MEDIA ---
router.post('/galeria/eventos/:id/media/bulk', (req, res) => {
    upload.array('files', 50)(req, res, async (err) => {
        if (err) {
            console.error('MULTER ERROR:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Uno o más archivos exceden el límite de 200MB' });
            }
            return res.status(400).json({ error: err.message });
        }
        
        const evento_id = req.params.id;
        try {
            if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No se subieron archivos' });
            
            const [currentMedia] = await db.query('SELECT MAX(orden) as max_orden FROM web_galeria_media WHERE evento_id = ?', [evento_id]);
            const startOrder = (currentMedia[0]?.max_orden || 0) + 1;

            const insertedMedia = [];
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const tipo = file.mimetype.startsWith('video/') ? 'video' : 'image';
                const url = `/uploads/gallery/${file.filename}`;
                const orden = startOrder + i;
                
                const [result] = await db.query(
                    'INSERT INTO web_galeria_media (evento_id, url, tipo, orden) VALUES (?, ?, ?, ?)', 
                    [evento_id, url, tipo, orden]
                );
                
                insertedMedia.push({
                    id: result.insertId,
                    evento_id,
                    url,
                    tipo,
                    orden
                });
            }
            
            res.json({ success: true, media: insertedMedia });
        } catch (err) {
            console.error('SERVER ERROR IN BULK UPLOAD:', err);
            res.status(500).json({ error: err.message });
        }
    });
});

router.post('/galeria/eventos/:id/media/embed', async (req, res) => {
    const evento_id = req.params.id;
    const { url } = req.body;
    try {
        const [currentMedia] = await db.query('SELECT MAX(orden) as max_orden FROM web_galeria_media WHERE evento_id = ?', [evento_id]);
        const orden = (currentMedia[0]?.max_orden || 0) + 1;
        
        const [result] = await db.query(
            'INSERT INTO web_galeria_media (evento_id, url, tipo, orden) VALUES (?, ?, ?, ?)',
            [evento_id, url, 'video', orden]
        );
        
        const newMedia = {
            id: result.insertId,
            evento_id,
            url,
            tipo: 'video',
            orden
        };
        
        res.json({ success: true, media: newMedia });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/galeria/eventos/:id/media/reorder', async (req, res) => {
    const { orderData } = req.body; // Array de { id, orden }
    try {
        const queries = orderData.map(item => 
            db.query('UPDATE web_galeria_media SET orden = ? WHERE id = ?', [item.orden, item.id])
        );
        await Promise.all(queries);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/galeria/media/embed', async (req, res) => {
    const { evento_id, external_url } = req.body;
    try {
        const [currentMedia] = await db.query('SELECT MAX(orden) as max_orden FROM web_galeria_media WHERE evento_id = ?', [evento_id]);
        const newOrder = (currentMedia[0]?.max_orden || 0) + 1;

        await db.query(
            'INSERT INTO web_galeria_media (evento_id, external_url, tipo, orden) VALUES (?, ?, "embed", ?)', 
            [evento_id, external_url, newOrder]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/galeria/media/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM web_galeria_media WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
