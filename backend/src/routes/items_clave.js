const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Get all key items for a client
 */
router.get('/:cot_id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM event_puntos_clave WHERE cot_id = ? ORDER BY categoria, orden ASC',
            [req.params.cot_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Create or Update key item
 */
router.post('/', async (req, res) => {
    const { id, cot_id, categoria, titulo, valor, nota, completado, orden, tipo, icono, enlace } = req.body;
    try {
        if (id) {
            await db.query(
                `UPDATE event_puntos_clave SET 
                categoria=?, titulo=?, valor=?, nota=?, completado=?, orden=?, tipo=?, icono=?, enlace=?
                WHERE id=?`,
                [categoria, titulo, valor, nota, completado ? 1 : 0, orden || 0, tipo || 'Texto', icono || 'Star', enlace || null, id]
            );
            res.json({ success: true, id });
        } else {
            const [result] = await db.query(
                `INSERT INTO event_puntos_clave (cot_id, categoria, titulo, valor, nota, completado, orden, tipo, icono, enlace)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cot_id, categoria, titulo, valor, nota, completado ? 1 : 0, orden || 0, tipo || 'Texto', icono || 'Star', enlace || null]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Quick toggle completion
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        await db.query('UPDATE event_puntos_clave SET completado = NOT completado WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete key item
 */
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM event_puntos_clave WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
