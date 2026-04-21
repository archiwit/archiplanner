const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');
const whatsAppService = require('../services/WhatsAppService');
const notificationService = require('../services/notificationService');

/**
 * Obtener estado de documentos de una cotización
 */
router.get('/status/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT pdf_path, contrato_path FROM cotizaciones WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Subir PDF Manualmente (Cotización o Contrato)
 * Estructura de nombre: YYMMDD • TIPO • CLIENTE.pdf
 */
router.post('/upload/:id/:type', upload.single('file'), async (req, res) => {
    const { id, type } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    try {
        // 1. Obtener datos para nombre estructurado
        const [rows] = await db.query(`
            SELECT c.fevent, c.fcoti, c.tipo_evento, cl.nombre, cl.apellido 
            FROM cotizaciones c
            JOIN clientes cl ON c.cli_id = cl.id
            WHERE c.id = ?
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
        const data = rows[0];

        // 2. Formatear nombre estructurado (v5.3)
        // Estructura solicitada: YYMMDD • TIPO • NOMBRE
        const dateStr = (data.fevent || data.fcoti || new Date()).toISOString().slice(2, 10).replace(/-/g, '');
        const eventType = (data.tipo_evento || 'EVENTO').toUpperCase();
        const clientName = `${data.nombre} ${data.apellido || ''}`.trim().toUpperCase();
        
        const finalName = `${dateStr} • ${eventType} • ${clientName}.pdf`;

        // 3. Mover y renombrar
        const targetDir = path.join(__dirname, '../../uploads', type === 'cotizacion' ? 'cotizaciones' : 'contratos');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const finalPath = path.join(targetDir, finalName);
        fs.renameSync(req.file.path, finalPath);

        const publicPath = `/uploads/${type === 'cotizacion' ? 'cotizaciones' : 'contratos'}/${finalName}`;

        // 4. Actualizar DB
        const dbField = type === 'cotizacion' ? 'pdf_path' : 'contrato_path';
        await db.query(`UPDATE cotizaciones SET ${dbField} = ? WHERE id = ?`, [publicPath, id]);

        res.json({ success: true, path: publicPath, name: finalName });
    } catch (err) {
        console.error('Error en upload:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Enviar Documentos (WhatsApp o Email)
 */
router.post('/send/:id', async (req, res) => {
    const { id } = req.params;
    const { method, type, message } = req.body; // method: 'whatsapp', 'email', 'both'

    try {
        const [rows] = await db.query(`
            SELECT c.*, cl.nombre, cl.apellido, cl.correo, cl.telefono 
            FROM cotizaciones c
            JOIN clientes cl ON c.cli_id = cl.id
            WHERE c.id = ?
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
        const coti = rows[0];

        let filePath = type === 'cotizacion' ? coti.pdf_path : coti.contrato_path;
        
        // v5.3 / Arriendos: Si el archivo no existe o queremos forzar regeneración automática al enviar
        if (!filePath) {
            const documentService = require('../services/DocumentService');
            if (coti.clase === 'arriendo' && type === 'cotizacion') {
                const doc = await documentService.generateRentalPDF(id);
                filePath = `/uploads/arriendos/${path.basename(doc.path)}`;
            } else if (type === 'cotizacion') {
                const doc = await documentService.generateQuotationPDF(id);
                filePath = `/uploads/cotizaciones/${path.basename(doc.path)}`;
            } else if (type === 'contrato') {
                const doc = await documentService.generateContractPDF(id);
                filePath = `/uploads/contratos/${path.basename(doc.path)}`;
            }
        }

        if (!filePath) return res.status(400).json({ error: 'El archivo aún no ha sido cargado o generado' });

        const absolutePath = path.join(__dirname, '../..', filePath);
        const filename = path.basename(filePath);
        const publicUrl = `${process.env.WEB_URL || 'http://localhost:5173'}${filePath}`;

        // Contenido del mensaje dinámico (Personalizado por clase)
        const defaultMsg = coti.clase === 'arriendo' 
            ? `Hola ${coti.nombre}, adjunto tu recibo de arriendo. ¡Gracias por confiar en nosotros!`
            : `Hola ${coti.nombre}, adjunto la cotización para lograr crear tu evento soñado.\nTu visión, nuestra magia ✨`;
            
        const finalMessage = message || defaultMsg;

        let results = { whatsapp: false, email: false };

        if (method === 'whatsapp' || method === 'both') {
            results.whatsapp = await whatsAppService.sendDocument(coti.telefono, publicUrl, filename);
            if (message) await whatsAppService.sendMessage(coti.telefono, finalMessage);
        }

        if (method === 'email' || method === 'both') {
            results.email = await notificationService.sendClientEmail({
                to: coti.correo,
                subject: `${coti.clase === 'arriendo' ? 'RECIBO DE ARRIENDO' : type.toUpperCase()} - ArchiPlanner`,
                html: `<p>${finalMessage.replace(/\n/g, '<br>')}</p>`,
                attachments: [{
                    filename: filename,
                    path: absolutePath
                }]
            });
        }

        res.json({ success: true, results });
    } catch (err) {
        console.error('Error en envío:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Descargar/Ver Recibo de Pago (Preexistente)
 */
router.get('/recibo/:id', async (req, res) => {
    try {
        const receiptService = require('../services/ReceiptService');
        const pdfPath = await receiptService.generateReceiptPDF(req.params.id);
        if (fs.existsSync(pdfPath)) res.download(pdfPath);
        else res.status(404).json({ error: 'Archivo no encontrado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Generar y Descargar Itinerario (V5.3)
 */
router.get('/itinerario/:id', async (req, res) => {
    try {
        const documentService = require('../services/DocumentService');
        const { path: pdfPath } = await documentService.generateItineraryPDF(req.params.id);
        if (fs.existsSync(pdfPath)) res.download(pdfPath);
        else res.status(404).json({ error: 'Archivo no encontrado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Generar y Descargar Recibo de Arriendo (V5.3)
 */
router.get('/arriendo/:id', async (req, res) => {
    try {
        const documentService = require('../services/DocumentService');
        const { path: pdfPath } = await documentService.generateRentalPDF(req.params.id);
        if (fs.existsSync(pdfPath)) res.download(pdfPath);
        else res.status(404).json({ error: 'Archivo no encontrado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
