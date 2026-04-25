const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const googleCalendarService = require('../services/googleCalendarService');

/**
 * Get all activities (filtered by conf_id or client)
 * Includes gallery photos
 */
router.get('/', async (req, res) => {
    try {
        const { cli_id, cot_id, conf_id, is_public } = req.query;
        let query = `
            SELECT a.*, c.nombre as cliente_nombre, cot.tipo_evento as evento_titulo
            FROM actividades a 
            LEFT JOIN clientes c ON a.cli_id = c.id
            LEFT JOIN cotizaciones cot ON a.cot_id = cot.id
        `;
        const params = [];

        let whereClauses = [];
        if (cli_id) {
            whereClauses.push('a.cli_id = ?');
            params.push(cli_id);
        }
        if (cot_id) {
            whereClauses.push('a.cot_id = ?');
            params.push(cot_id);
        }
        if (conf_id) {
            whereClauses.push('a.conf_id = ?');
            params.push(conf_id);
        }
        if (is_public !== undefined) {
            whereClauses.push('a.is_public = ?');
            params.push(is_public === 'true' ? 1 : 0);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY a.fecha_inicio ASC';
        const [rows] = await db.query(query, params);

        // Fetch photos for each activity
        const activitiesWithPhotos = await Promise.all(rows.map(async (act) => {
            const [photos] = await db.query('SELECT foto_path FROM actividad_fotos WHERE act_id = ?', [act.id]);
            return { ...act, fotos: photos.map(p => p.foto_path) };
        }));

        res.json(activitiesWithPhotos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Create new activity
 */
router.post('/', async (req, res) => {
    const { titulo, descripcion, resumen, tipo, fecha_inicio, fecha_fin, ubicacion, cli_id, cot_id, u_id, conf_id, color, all_day, is_public } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO actividades (titulo, descripcion, resumen, tipo, fecha_inicio, fecha_fin, ubicacion, cli_id, cot_id, u_id, conf_id, color, all_day, is_public)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion, resumen || '', tipo, fecha_inicio, fecha_fin, ubicacion, cli_id || null, cot_id || null, u_id || null, conf_id || 1, color || '#B76E79', all_day ? 1 : 0, is_public !== undefined ? is_public : 1]
        );

        const activityId = result.insertId;

        // Sync with Google Calendar if user is connected
        if (u_id) {
            await googleCalendarService.syncEvent(u_id, activityId);
        }

        res.json({ success: true, id: activityId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Update activity
 */
router.put('/:id', async (req, res) => {
    const { titulo, descripcion, resumen, tipo, fecha_inicio, fecha_fin, ubicacion, cli_id, cot_id, u_id, estado, color, all_day, is_public } = req.body;
    try {
        await db.query(
            `UPDATE actividades SET 
             titulo=?, descripcion=?, resumen=?, tipo=?, fecha_inicio=?, fecha_fin=?, ubicacion=?, cli_id=?, cot_id=?, u_id=?, estado=?, color=?, all_day=?, is_public=?
             WHERE id=?`,
            [titulo, descripcion, resumen || '', tipo, fecha_inicio, fecha_fin, ubicacion, cli_id || null, cot_id || null, u_id || null, estado, color, all_day ? 1 : 0, is_public !== undefined ? is_public : 1, req.params.id]
        );

        // Sync update with Google
        const [actRows] = await db.query('SELECT u_id FROM actividades WHERE id = ?', [req.params.id]);
        if (actRows.length && actRows[0].u_id) {
            await googleCalendarService.syncEvent(actRows[0].u_id, req.params.id);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Add photos to activity gallery
 */
router.post('/:id/photos', upload.array('fotos', 10), async (req, res) => {
    try {
        const act_id = req.params.id;
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No se subieron archivos' });

        const queries = req.files.map(file => {
            return db.query('INSERT INTO actividad_fotos (act_id, foto_path) VALUES (?, ?)', [act_id, `/uploads/gallery/${file.filename}`]);
        });
        await Promise.all(queries);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete activity
 */
router.delete('/:id', async (req, res) => {
    try {
        const [actRows] = await db.query('SELECT u_id, google_event_id FROM actividades WHERE id = ?', [req.params.id]);
        
        if (actRows.length && actRows[0].u_id && actRows[0].google_event_id) {
            await googleCalendarService.deleteEvent(actRows[0].u_id, actRows[0].google_event_id);
        }

        await db.query('DELETE FROM actividades WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
