const pool = require('../db');

// Obtener todos los gastos de una cotización
exports.getGastosByCotizacion = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM gastos WHERE cot_id = ? ORDER BY fgasto DESC', [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Registrar un nuevo gasto (v2)
exports.crearGasto = async (req, res) => {
    const { 
        cotizacion_id, 
        concepto, 
        monto, 
        pagado_a, 
        responsable, 
        metodo,
        estado,
        item_id,
        categoria
    } = req.body;
    
    const comprobante_path = req.file ? `/uploads/gastos/${req.file.filename}` : null;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO gastos (cot_id, concepto, monto, fgasto, pagado_a, responsable, metodo, comprobante_path, u_id, estado, item_id, categoria) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                cotizacion_id, 
                concepto, 
                monto, 
                pagado_a, 
                responsable, 
                metodo ? metodo.toLowerCase() : 'efectivo', 
                comprobante_path, 
                req.body.u_id || 1,
                estado || 'pendiente',
                item_id || null,
                categoria || 'General'
            ]
        );
        
        res.status(201).json({ 
            success: true, 
            id: result.insertId, 
            message: 'Gasto registrado correctamente.' 
        });
    } catch (err) {
        console.error('Error insertando gasto:', err);
        res.status(500).json({ error: err.message });
    }
};

// Actualizar estado de un gasto
exports.updateGastoEstado = async (req, res) => {
    const { estado } = req.body;
    try {
        await pool.query('UPDATE gastos SET estado = ? WHERE id = ?', [estado, req.params.id]);
        res.json({ success: true, message: 'Estado del gasto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un gasto
exports.eliminarGasto = async (req, res) => {
    try {
        await pool.query('DELETE FROM gastos WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Gasto eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
