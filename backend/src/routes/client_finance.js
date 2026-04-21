const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Get financial summary for a client
 */
router.get('/:cli_id', async (req, res) => {
    try {
        const cli_id = req.params.cli_id;

        // 1. Get Sum of approved quotations
        const [quoteSum] = await db.query(
            "SELECT SUM(monto_final) as total FROM cotizaciones WHERE cli_id = ? AND estado IN ('aprobada', 'facturada')",
            [cli_id]
        );
        const totalEvento = quoteSum[0].total || 0;

        // 2. Get Sum of completed payments
        const [paymentSum] = await db.query(
            "SELECT SUM(monto) as paid FROM pagos p JOIN cotizaciones c ON p.cot_id = c.id WHERE c.cli_id = ? AND p.estado = 'completado'",
            [cli_id]
        );
        const totalPagado = paymentSum[0].paid || 0;

        // 3. Get detailed list of payments
        const [payments] = await db.query(
            "SELECT p.*, c.num as cot_num FROM pagos p JOIN cotizaciones c ON p.cot_id = c.id WHERE c.cli_id = ? ORDER BY p.fpago DESC",
            [cli_id]
        );

        // 4. Get active quotation details for color palette and other data
        const [activeQuote] = await db.query(
            "SELECT id, num, paleta_colores, tematica, fevent, lugar, monto_final FROM cotizaciones WHERE cli_id = ? AND estado IN ('aprobada', 'facturada', 'enviada') ORDER BY id DESC LIMIT 1",
            [cli_id]
        );

        res.json({
            summary: {
                total: totalEvento,
                paid: totalPagado,
                balance: totalEvento - totalPagado,
                completionPercentage: totalEvento > 0 ? (totalPagado / totalEvento) * 100 : 0
            },
            payments: payments || [],
            activeQuote: activeQuote[0] || { 
                id: null, 
                num: '---', 
                tematica: 'Mi Evento ArchiPlanner', 
                lugar: 'Ubicación por confirmar', 
                total: 0,
                monto_final: 0
            }
        });
    } catch (err) {
        console.error('[FINANCE] Error getting client summary:', err);
        res.status(500).json({ error: err.message });
    }
});
/**
 * Get financial summary for a specific event/quotation
 */
router.get('/event/:cot_id', async (req, res) => {
    try {
        const cot_id = req.params.cot_id;

        // 1. Get info from the quotation
        const [quote] = await db.query(
            "SELECT id, num, cli_id, paleta_colores, tematica, fevent, lugar, monto_final FROM cotizaciones WHERE id = ?",
            [cot_id]
        );
        if (!quote.length) return res.status(404).json({ error: 'Evento no encontrado' });

        const totalEvento = quote[0].monto_final || 0;

        // 2. Get Sum of completed payments for this specific quote
        const [paymentSum] = await db.query(
            "SELECT SUM(monto) as paid FROM pagos WHERE cot_id = ? AND estado = 'completado'",
            [cot_id]
        );
        const totalPagado = paymentSum[0].paid || 0;

        // 3. Get detailed list of payments for this quote
        const [payments] = await db.query(
            "SELECT * FROM pagos WHERE cot_id = ? ORDER BY fpago DESC",
            [cot_id]
        );

        res.json({
            summary: {
                total: totalEvento,
                paid: totalPagado,
                balance: totalEvento - totalPagado,
                completionPercentage: totalEvento > 0 ? (totalPagado / totalEvento) * 100 : 0
            },
            payments,
            activeQuote: quote[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

