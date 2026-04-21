const pool = require('../db');

// Obtener todos los pagos de una cotización
exports.getPagosByCotizacion = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pagos WHERE cot_id = ? ORDER BY fpago DESC', [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Registrar un nuevo pago (Abono)
exports.crearPago = async (req, res) => {
    const { cotizacion_id, monto, metodo, nota } = req.body;
    const foto_comprobante = req.file ? `/uploads/pagos/${req.file.filename}` : null;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO pagos (cot_id, monto, metodo, foto_comprobante, referencia, fpago, estado) VALUES (?, ?, ?, ?, ?, NOW(), "pendiente")',
            [cotizacion_id, monto, metodo.toLowerCase(), foto_comprobante, nota]
        );
        res.status(201).json({ 
            success: true, 
            id: result.insertId, 
            message: 'Pago registrado correctamente. Pendiente de aprobación.' 
        });
    } catch (err) {
        console.error('Error insertando pago:', err);
        res.status(500).json({ error: err.message });
    }
};

// Aprobar un pago y marcar la cotización como 'contratada'
exports.aprobarPago = async (req, res) => {
    const { id } = req.params; // ID del pago
    const { usuario_id } = req.body; // ID del admin que aprueba

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Obtener el ID de la cotización asociada
            const [pago] = await connection.query('SELECT cot_id FROM pagos WHERE id = ?', [id]);
            if (pago.length === 0) throw new Error('Pago no encontrado');
            const cotizacion_id = pago[0].cot_id;

            // 2. Marcar el pago como completado (Aprobado)
            await connection.query(
                'UPDATE pagos SET estado = "completado", u_id = ? WHERE id = ?', 
                [usuario_id || 1, id]
            );

            // 3. Cambiar estado de la cotización a 'contratada'
            await connection.query(
                'UPDATE cotizaciones SET estado = "contratada" WHERE id = ?', 
                [cotizacion_id]
            );

            // 4. Sincronizar estado del cliente a 'contratado'
            const [cotiData] = await connection.query('SELECT cli_id FROM cotizaciones WHERE id = ?', [cotizacion_id]);
            if (cotiData.length > 0) {
                await connection.query('UPDATE clientes SET estado = "contratado" WHERE id = ?', [cotiData[0].cli_id]);
            }

            await connection.commit();

            // --- FLUJO DE AUTOMATIZACIÓN POS-APROBACIÓN ---
            try {
                const ReceiptService = require('../services/ReceiptService');
                const notificationService = require('../services/notificationService');
                const WhatsAppService = require('../services/WhatsAppService');

                // 1. Generar el PDF del recibo
                const pdfPath = await ReceiptService.generateReceiptPDF(id);
                const filename = `Recibo_Pago_${id}.pdf`;

                // 2. Obtener datos completos del cliente para notificar
                const [clientData] = await pool.query(`
                    SELECT cl.*, p.monto as pago_monto 
                    FROM clientes cl 
                    JOIN cotizaciones c ON cl.id = c.cli_id
                    JOIN pagos p ON c.id = p.cot_id
                    WHERE p.id = ?
                `, [id]);

                if (clientData.length > 0) {
                    const cliente = clientData[0];
                    const publicUrl = `/uploads/recibos/${require('path').basename(pdfPath)}`;

                    // 3. Enviar Email con Adjunto
                    await notificationService.sendClientEmail({
                        to: cliente.correo,
                        subject: 'Comprobante de Pago Aprobado - ArchiPlanner',
                        html: `
                            <h2>¡Hola ${cliente.nombre}!</h2>
                            <p>Te confirmamos que hemos recibido y aprobado tu pago por <strong>$${Number(cliente.pago_monto).toLocaleString()}</strong>.</p>
                            <p>Adjunto a este correo encontrarás el comprobante oficial en formato PDF.</p>
                            <p>Estamos emocionados de seguir trabajando en tu evento.</p>
                        `,
                        attachments: [{
                            filename: filename,
                            path: pdfPath
                        }]
                    });

                    // 4. Enviar WhatsApp (Si está configurado)
                    await WhatsAppService.notifyPaymentApproved(cliente, cliente.pago_monto, publicUrl);
                }
            } catch (autoErr) {
                console.error('[Automation] Error disparando notificaciones:', autoErr.message);
                // No fallamos la respuesta principal si la notificación falla
            }

            res.json({ 
                success: true, 
                message: 'Pago aprobado y notificaciones enviadas.' 
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error aprobando pago:', err);
        res.status(500).json({ error: err.message });
    }
};

// Generar o simular recibo de pago (Para el PDF)
exports.getReciboData = async (req, res) => {
    try {
        const [pago] = await pool.query(`
            SELECT p.*, c.num as cotizacion_num, cl.nombre as cliente_nombre 
            FROM pagos p
            JOIN cotizaciones c ON p.cot_id = c.id
            JOIN clientes cl ON c.cli_id = cl.id
            WHERE p.id = ?
        `, [req.params.id]);
        
        if (pago.length === 0) return res.status(404).json({ message: 'Recibo no encontrado' });
        res.json(pago[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
