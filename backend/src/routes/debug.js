const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/config-check', (req, res) => {
    res.json({
        has_client_id: !!process.env.GOOGLE_CLIENT_ID,
        client_id_prefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'MISSING',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'UNSET',
        node_env: process.env.NODE_ENV
    });
});

router.get('/fix-event-layouts', async (req, res) => {
    try {
        console.log("[DEBUG] Inicianando corrección de esquema event_layouts...");
        const [cols] = await db.query('DESCRIBE event_layouts');
        const colNames = cols.map(c => c.Field);
        
        const missing = [];
        if (!colNames.includes('fondo_url')) missing.push('ADD COLUMN fondo_url VARCHAR(255) AFTER is_metric');
        if (!colNames.includes('notas_montaje')) missing.push('ADD COLUMN notas_montaje TEXT AFTER fondo_url');
        if (!colNames.includes('materiales_globales')) missing.push('ADD COLUMN materiales_globales JSON AFTER notas_montaje');
        if (!colNames.includes('config_json')) missing.push('ADD COLUMN config_json JSON AFTER materiales_globales');

        if (missing.length > 0) {
            console.log("[DEBUG] Columnas faltantes detectadas:", missing);
            await db.query(`ALTER TABLE event_layouts ${missing.join(', ')}`);
            return res.json({ success: true, fixed: missing });
        }
        
        res.json({ success: true, message: 'El esquema ya está actualizado' });
    } catch (err) {
        console.error("[DEBUG] Error en fix-event-layouts:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
