const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../db');

class ReceiptService {
    /**
     * Generar un PDF profesional para un recibo de pago
     * @param {number} pagoId - ID del pago aprobado
     * @returns {Promise<string>} - Ruta completa al archivo PDF generado
     */
    async generateReceiptPDF(pagoId) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Obtener datos del pago, cliente y cotización
                const [pagoRows] = await db.query(`
                    SELECT p.*, c.num as cotizacion_num, c.total as total_cotizacion, c.monto_final as monto_final_cotizacion,
                           cl.nombre as cliente_nombre, cl.apellido as cliente_apellido, cl.documento as cliente_cedula, cl.correo as cliente_correo
                    FROM pagos p
                    JOIN cotizaciones c ON p.cot_id = c.id
                    JOIN clientes cl ON c.cli_id = cl.id
                    WHERE p.id = ?
                `, [pagoId]);

                if (pagoRows.length === 0) throw new Error('Pago no encontrado');
                const pago = pagoRows[0];

                // 2. Obtener configuración de la empresa (Logo, Nit, etc.)
                const [configRows] = await db.query('SELECT * FROM configuracion WHERE es_activa = 1 LIMIT 1');
                const config = configRows[0] || {};

                // 3. Preparar directorio
                const dir = path.join(__dirname, '../../uploads/recibos');
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                const filename = `recibo-${pago.id}-${Date.now()}.pdf`;
                const filePath = path.join(dir, filename);
                const publicPath = `/uploads/recibos/${filename}`;

                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- DISEÑO DEL PDF ---
                
                // Logo & Encabezado
                const logoPath = config.logo_cuadrado_path ? path.join(__dirname, '../../', config.logo_cuadrado_path) : null;
                const isSupportedImage = logoPath && (logoPath.toLowerCase().endsWith('.png') || logoPath.toLowerCase().endsWith('.jpg') || logoPath.toLowerCase().endsWith('.jpeg'));

                if (isSupportedImage && fs.existsSync(logoPath)) {
                    try {
                        doc.image(logoPath, 50, 45, { width: 80 });
                    } catch (e) {
                        console.warn('[ReceiptService] Error embedding image, skipping:', e.message);
                    }
                }

                doc.fillColor('#444444')
                   .fontSize(20)
                   .text(config.nombre_empresa || 'ArchiPlanner', 150, 50, { align: 'right' })
                   .fontSize(10)
                   .text(config.city || 'Colombia', 150, 75, { align: 'right' })
                   .text(`Tel: ${config.telefono || ''}`, 150, 90, { align: 'right' })
                   .text(config.email_contacto || '', 150, 105, { align: 'right' });

                doc.moveDown();
                doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, 135).lineTo(550, 135).stroke();

                // Título del Documento
                doc.fillColor('#B76E79')
                   .fontSize(18)
                   .text('RECIBO DE PAGO / ABONO', 50, 160, { width: 500, align: 'center' });

                doc.moveDown();

                // Información del Recibo
                doc.fillColor('#444444').fontSize(10);
                doc.text(`Recibo N°: REC-${pago.id.toString().padStart(6, '0')}`, 50, 200);
                doc.text(`Fecha: ${new Date(pago.fpago).toLocaleDateString()}`, 50, 215);
                doc.text(`Cotización: ${pago.cotizacion_num}`, 50, 230);

                // Cuadro de Cliente
                doc.rect(50, 260, 500, 70).fillAndStroke('#f9f9f9', '#eeeeee');
                doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold')
                   .text('DATOS DEL CLIENTE', 65, 270);
                
                doc.font('Helvetica').fontSize(10)
                   .text(`Nombre: ${pago.cliente_nombre} ${pago.cliente_apellido}`, 65, 290)
                   .text(`Documento: ${pago.cliente_cedula || 'N/A'}`, 65, 305)
                   .text(`Email: ${pago.cliente_correo}`, 300, 290);

                // Tabla de Detalles de Pago
                doc.moveDown(5);
                const tableTop = 350;
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('CONCEPTO', 50, tableTop);
                doc.text('MÉTODO', 300, tableTop);
                doc.text('MONTO', 450, tableTop, { align: 'right' });

                doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

                doc.font('Helvetica').fontSize(10);
                doc.text('Abono a Cotización de Evento', 50, tableTop + 30);
                doc.text(pago.metodo.toUpperCase(), 300, tableTop + 30);
                doc.text(`$${Number(pago.monto).toLocaleString()}`, 450, tableTop + 30, { align: 'right' });

                // Totales y Saldos
                const totalsTop = tableTop + 70;
                doc.rect(300, totalsTop, 250, 80).fill('#f1f1f1');
                doc.fillColor('#333333');
                
                doc.text('TOTAL COTIZACIÓN:', 315, totalsTop + 15);
                doc.text(`$${Number(pago.monto_final_cotizacion).toLocaleString()}`, 450, totalsTop + 15, { align: 'right' });

                doc.font('Helvetica-Bold')
                   .text('VALOR ABONADO:', 315, totalsTop + 35);
                doc.text(`$${Number(pago.monto).toLocaleString()}`, 450, totalsTop + 35, { align: 'right' });

                const saldo = Number(pago.monto_final_cotizacion) - Number(pago.monto); // Nota: Simplificado para este recibo individual
                doc.fillColor('#B76E79')
                   .text('SALDO PENDIENTE:', 315, totalsTop + 55);
                doc.text(`$${saldo.toLocaleString()}`, 450, totalsTop + 55, { align: 'right' });

                // Pie de página
                doc.fillColor('#aaaaaa')
                   .fontSize(8)
                   .text('Este documento es un comprobante de pago generado automáticamente por ArchiPlanner.', 50, 700, { align: 'center' })
                   .text('Gracias por confiar en nosotros para la organización de tu evento especial.', 50, 715, { align: 'center' });

                doc.end();

                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);

            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new ReceiptService();
