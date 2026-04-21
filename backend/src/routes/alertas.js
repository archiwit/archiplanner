const express = require('express');
const router = express.Router();
const db = require('../db');

// GET filtered alerts (unread first)
router.get('/', async (req, res) => {
    const { u_id, rol } = req.query;
    try {
        let query = 'SELECT * FROM alertas';
        let params = [];

        const isStaff = ['admin', 'coordinador', 'asesor', 'vendedor', 'decorador', 'superusuario'].includes(rol?.toLowerCase());

        if (rol === 'cliente') {
            // Clients only see alerts specifically for them
            query += ' WHERE u_id = ? AND tipo IN ("recordatorio", "pago_vencido", "evento_proximo")';
            params.push(u_id);
        } else if (isStaff) {
            // Staff see direct alerts or system alerts
            query += ' WHERE u_id = ? OR u_id IS NULL';
            params.push(u_id);
        } else {
            // Fallback: minimal view
            query += ' WHERE u_id = ?';
            params.push(u_id || 0);
        }

        query += ' ORDER BY leida ASC, fecha_creacion DESC LIMIT 50';
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET unread count
router.get('/unread-count', async (req, res) => {
    const { u_id, rol } = req.query;
    try {
        let query = 'SELECT COUNT(*) as count FROM alertas WHERE leida = 0';
        let params = [];

        const isStaff = ['admin', 'coordinador', 'asesor', 'vendedor', 'decorador', 'superusuario'].includes(rol?.toLowerCase());

        if (rol === 'cliente') {
            query += ' AND u_id = ? AND tipo IN ("recordatorio", "pago_vencido", "evento_proximo")';
            params.push(u_id);
        } else if (isStaff) {
            query += ' AND (u_id = ? OR u_id IS NULL)';
            params.push(u_id);
        } else {
            query += ' AND u_id = ?';
            params.push(u_id || 0);
        }

        const [rows] = await db.query(query, params);
        res.json({ count: rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Mark as read
router.post('/read/:id', async (req, res) => {
    try {
        await db.query('UPDATE alertas SET leida = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Mark all as read
router.post('/read-all', async (req, res) => {
    try {
        await db.query('UPDATE alertas SET leida = 1 WHERE leida = 0');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
