const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET all services
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servicios ORDER BY orden ASC, id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET services by section (principales vs sociales)
router.get('/section/:seccion', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servicios WHERE seccion = ? AND visible = 1 ORDER BY orden ASC', [req.params.seccion]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new service
router.post('/', upload.single('imagen'), async (req, res) => {
    const { titulo, tag, icono_svg, descripcion, link, visible, orden, seccion } = req.body;
    const imagen = req.file ? `/uploads/services/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            'INSERT INTO servicios (titulo, tag, icono_svg, descripcion, link, visible, orden, seccion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, tag, icono_svg, descripcion, link || '/contacto', visible !== undefined ? visible : 1, orden || 0, seccion || 'principales', imagen]
        );
        res.json({ success: true, id: result.insertId, imagen });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update service
router.put('/:id', upload.single('imagen'), async (req, res) => {
    const { titulo, tag, icono_svg, descripcion, link, visible, orden, seccion, imagen_path } = req.body;
    let imagen = imagen_path;

    if (req.file) {
        imagen = `/uploads/services/${req.file.filename}`;
    }

    try {
        await db.query(`
            UPDATE servicios SET 
            titulo = ?, tag = ?, icono_svg = ?, descripcion = ?, link = ?, visible = ?, orden = ?, seccion = ?, imagen = ?
            WHERE id = ?
        `, [titulo, tag, icono_svg, descripcion, link || '/contacto', visible, orden || 0, seccion || 'principales', imagen, req.params.id]);
        
        res.json({ success: true, imagen });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE service
router.delete('/:id', async (req, res) => {
    try {
        // Delete image file first
        const [rows] = await db.query('SELECT imagen FROM servicios WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].imagen) {
            const filePath = path.join(__dirname, '../..', rows[0].imagen);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM servicios WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
