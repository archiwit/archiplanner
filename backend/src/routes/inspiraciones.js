const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');

/**
 * Get all inspiration items for a client
 */
router.get('/:cot_id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM event_inspiraciones WHERE cot_id = ? ORDER BY created_at DESC',
            [req.params.cot_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Create inspiration item
 */
router.post('/', upload.single('foto'), async (req, res) => {
    const { cot_id, titulo, categoria, zona, descripcion, subido_por } = req.body;
    
    if (!req.file && !req.body.foto_path) {
        return res.status(400).json({ error: 'La foto es obligatoria para el Inspire Board' });
    }

    const foto_path = req.file ? `/uploads/gallery/${req.file.filename}` : req.body.foto_path;

    try {
        const [result] = await db.query(
            `INSERT INTO event_inspiraciones (cot_id, foto_path, titulo, categoria, zona, descripcion, subido_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cot_id, foto_path, titulo || '', categoria || 'General', zona || 'General', descripcion || '', subido_por || 'admin']
        );
        res.json({ success: true, id: result.insertId, foto_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete inspiration item
 */
router.delete('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT foto_path FROM event_inspiraciones WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            // Optional: delete physical file
        }
        await db.query('DELETE FROM event_inspiraciones WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
