const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');

/**
 * Get all itinerary items for a client
 */
router.get('/:cot_id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM event_itinerarios WHERE cot_id = ? ORDER BY orden ASC, hora ASC',
            [req.params.cot_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Create or update itinerary item (includes file upload)
 */
router.post('/', upload.single('foto'), async (req, res) => {
    const { id, cot_id, parent_id, titulo, responsable, descripcion, icono, hora, orden, recursos, punto_clave_id } = req.body;
    const foto_path = req.file ? `/uploads/itinerary/${req.file.filename}` : req.body.foto_path;

    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query(
                `UPDATE event_itinerarios SET 
                titulo=?, responsable=?, descripcion=?, icono=?, foto_path=?, hora=?, orden=?, parent_id=?, recursos=?, punto_clave_id=?
                WHERE id=?`,
                [titulo, responsable, descripcion, icono, foto_path, hora || null, orden || 0, parent_id || null, recursos || null, punto_clave_id || null, id]
            );
            res.json({ success: true, id, foto_path });
        } else {
            const [result] = await db.query(
                `INSERT INTO event_itinerarios (cot_id, parent_id, titulo, responsable, descripcion, icono, foto_path, hora, orden, recursos, punto_clave_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cot_id, parent_id || null, titulo, responsable, descripcion, icono || 'Clock', foto_path, hora || null, orden || 0, recursos || null, punto_clave_id || null]
            );
            res.json({ success: true, id: result.insertId, foto_path });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete itinerary item
 */
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM event_itinerarios WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
