const db = require('../db');
const path = require('path');
const fs = require('fs');

const gastosEmpresaController = {
    // List all company expenses
    getAll: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT g.*, u.nombre as creado_por 
                FROM gastos_empresa g
                LEFT JOIN usuarios u ON g.u_id = u.id
                ORDER BY g.fecha DESC, g.id DESC
            `);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Create a new expense
    create: async (req, res) => {
        const { concepto, categoria, monto, fecha, estado, notas, u_id } = req.body;
        const comprobante_path = req.file ? `/uploads/gastos/${req.file.filename}` : null;

        try {
            const [result] = await db.query(
                'INSERT INTO gastos_empresa (concepto, categoria, monto, fecha, comprobante_path, estado, notas, u_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [concepto, categoria, monto || 0, fecha, comprobante_path, estado || 'pagado', notas || '', u_id || null]
            );
            res.json({ success: true, id: result.insertId, comprobante_path });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Update an expense
    update: async (req, res) => {
        const { concepto, categoria, monto, fecha, estado, notas } = req.body;
        let comprobante_path = req.body.comprobante_path;

        if (req.file) {
            comprobante_path = `/uploads/gastos/${req.file.filename}`;
        }

        try {
            await db.query(
                'UPDATE gastos_empresa SET concepto=?, categoria=?, monto=?, fecha=?, comprobante_path=?, estado=?, notas=? WHERE id=?',
                [concepto, categoria, monto || 0, fecha, comprobante_path, estado, notas || '', req.params.id]
            );
            res.json({ success: true, comprobante_path });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Delete an expense
    delete: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT comprobante_path FROM gastos_empresa WHERE id = ?', [req.params.id]);
            if (rows.length > 0 && rows[0].comprobante_path) {
                const filePath = path.join(__dirname, '../../', rows[0].comprobante_path);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            await db.query('DELETE FROM gastos_empresa WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get reports (Summary)
    getReportes: async (req, res) => {
        try {
            // Aggregate by category
            const [byCategory] = await db.query(`
                SELECT categoria, SUM(monto) as total 
                FROM gastos_empresa 
                GROUP BY categoria
            `);

            // Aggregate by month (last 6 months)
            const [byMonth] = await db.query(`
                SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, SUM(monto) as total 
                FROM gastos_empresa 
                WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY mes
                ORDER BY mes ASC
            `);

            // Pendientes vs Pagados
            const [byStatus] = await db.query(`
                SELECT estado, SUM(monto) as total 
                FROM gastos_empresa 
                GROUP BY estado
            `);

            res.json({ byCategory, byMonth, byStatus });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = gastosEmpresaController;
