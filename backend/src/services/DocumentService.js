const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { numeroALetras } = require('./numberToWords');

class DocumentService {
    constructor() {
        this.baseDir = path.join(__dirname, '../../uploads');
        this.assetsDir = path.join(__dirname, '../../../frontend/public/images/cotizacion');
        
        // Colores Corporativos (ArchiPlanner Rose Gold / Pinkish)
        this.colors = {
            primary: '#ff8484',
            gold: '#D4AF37',
            dark: '#1a1a1c',
            light: '#f9f9f9',
            text: '#333333',
            muted: '#666666',
            border: '#eeeeee'
        };
    }

    /**
     * Generar nombre de archivo estandarizado: YYMMDD • TIPO • CLIENTE
     */
    generateStandardName(fecha, tipo, cliente) {
        const d = new Date(fecha || new Date());
        const yy = d.getFullYear().toString().slice(-2);
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        
        const cleanType = (tipo || 'EVENTO').toUpperCase();
        const cleanClient = (cliente || 'CLIENTE').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return `${yy}${mm}${dd} • ${cleanType} • ${cleanClient}`;
    }

    /**
     * Reemplazar archivo si existe
     */
    manageFileReplacement(dir, filename) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        return path.join(dir, filename + '.pdf');
    }

    formatCurrency(val) {
        return Number(val || 0).toLocaleString('es-CO');
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    }

    formatTime(timeStr) {
        if (!timeStr) return '';
        try {
            const parts = timeStr.split(':');
            let h = parseInt(parts[0]);
            const m = parts[1] || '00';
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
        } catch (e) { return timeStr; }
    }

    async generateQuotationPDF(cotId) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Obtener Datos
                const [rows] = await db.query(`
                    SELECT c.*, cl.nombre as cl_nombre, cl.apellido as cl_apellido, cl.correo as cl_correo, cl.telefono as cl_telefono
                    FROM cotizaciones c
                    JOIN clientes cl ON c.cli_id = cl.id
                    WHERE c.id = ?
                `, [cotId]);

                if (rows.length === 0) throw new Error('Cotización no encontrada');
                const cot = rows[0];
                
                // 1.1 Obtener Detalles
                const [detallesRows] = await db.query(`
                    SELECT d.*, a.nombre as art_nombre, l.nombre as loc_nombre, a.categoria as art_cat, l.tipo as loc_cat
                    FROM cotizacion_detalles d
                    LEFT JOIN articulos a ON d.art_id = a.id
                    LEFT JOIN locaciones l ON d.loc_id = l.id
                    WHERE d.cot_id = ?
                `, [cotId]);

                const detalles = detallesRows.map(d => ({
                    ...d,
                    nombre: d.art_nombre || d.loc_nombre || 'Item sin nombre',
                    categoria: d.art_cat || d.loc_cat || 'Servicios Generales'
                }));

                const [configRows] = await db.query('SELECT * FROM configuracion LIMIT 1');
                const config = configRows[0] || {};
                
                const clientFullName = `${cot.cl_nombre} ${cot.cl_apellido}`;
                const baseName = this.generateStandardName(cot.fevent || cot.fcoti, cot.tipo_evento, clientFullName);
                const filePath = this.manageFileReplacement(path.join(this.baseDir, 'cotizaciones'), baseName);

                // 2. Iniciar Documento
                const doc = new PDFDocument({ 
                    size: 'LETTER', 
                    margins: { top: 0, left: 0, bottom: 0, right: 0 },
                    bufferPages: true 
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                this._drawCoverPage(doc, cot, clientFullName, config);
                doc.addPage();
                this._drawAboutPage(doc);
                doc.addPage();
                this._drawGalleryPage(doc, cot.tipo_evento);
                doc.addPage();
                this._drawBudgetPage(doc, cot, detalles, config);
                doc.addPage();
                this._drawAdditionalPage(doc, detalles, config);
                doc.addPage();
                this._drawContactPage(doc, config);

                doc.end();

                stream.on('finish', () => {
                    db.query('UPDATE cotizaciones SET pdf_path = ? WHERE id = ?', [`/uploads/cotizaciones/${baseName}.pdf`, cotId]);
                    resolve({ path: filePath, name: baseName });
                });
                stream.on('error', reject);

            } catch (err) { reject(err); }
        });
    }

    async generateRentalPDF(cotId) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Obtener Datos
                const [rows] = await db.query(`
                    SELECT c.*, cl.nombre as cl_nombre, cl.apellido as cl_apellido, cl.correo as cl_correo, cl.telefono as cl_telefono
                    FROM cotizaciones c
                    JOIN clientes cl ON c.cli_id = cl.id
                    WHERE c.id = ?
                `, [cotId]);

                if (rows.length === 0) throw new Error('Arriendo no encontrado');
                const cot = rows[0];
                
                // 1.1 Obtener Detalles
                const [detallesRows] = await db.query(`
                    SELECT d.*, a.nombre as art_nombre, l.nombre as loc_nombre, a.categoria as art_cat, l.tipo as loc_cat
                    FROM cotizacion_detalles d
                    LEFT JOIN articulos a ON d.art_id = a.id
                    LEFT JOIN locaciones l ON d.loc_id = l.id
                    WHERE d.cot_id = ?
                `, [cotId]);

                const detalles = detallesRows.map(d => ({
                    ...d,
                    nombre: d.art_nombre || d.loc_nombre || 'Item sin nombre',
                    categoria: d.art_cat || d.loc_cat || 'Artículos en Arriendo'
                }));

                const [configRows] = await db.query('SELECT * FROM configuracion LIMIT 1');
                const config = configRows[0] || {};
                
                const clientFullName = `${cot.cl_nombre} ${cot.cl_apellido}`;
                const baseName = `RECIBO • ${cot.num_arriendo || cot.num} • ${clientFullName.toUpperCase()}`;
                
                // Ensure directory exists
                const arriendosDir = path.join(this.baseDir, 'arriendos');
                if (!fs.existsSync(arriendosDir)) fs.mkdirSync(arriendosDir, { recursive: true });
                
                const filePath = path.join(arriendosDir, baseName + '.pdf');

                // 2. Iniciar Documento
                const doc = new PDFDocument({ 
                    size: 'LETTER', 
                    margins: { top: 0, left: 0, bottom: 0, right: 0 },
                    bufferPages: true 
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- COVER ---
                const bgPath = path.join(this.assetsDir, 'cot_bgPort.png');
                if (fs.existsSync(bgPath)) { doc.image(bgPath, 0, 0, { width: 612, height: 792 }); }

                doc.fillColor('#ffffff').fontSize(40).font('Helvetica-Bold');
                doc.text('RECIBO DE ARRIENDO', 70, 450);
                
                doc.fontSize(16).font('Helvetica');
                doc.text('PREPARADO PARA:', 70, 500, { characterSpacing: 2 });
                
                doc.fillColor(this.colors.primary).fontSize(28).font('Helvetica-Bold');
                doc.text(clientFullName.toUpperCase(), 70, 525);

                doc.fillColor('#ffffff').fontSize(14).font('Helvetica');
                doc.text(`SERIE: ${cot.num_arriendo || cot.num} • SALIDA: ${this.formatDate(cot.fevent)}`, 70, 565);

                // --- BUDGET PAGE (REUSING AS RENTAL DETAILS) ---
                doc.addPage();
                const pgPath = path.join(this.assetsDir, 'cot_bgPag.png');
                if (fs.existsSync(pgPath)) { doc.image(pgPath, 0, 0, { width: 612, height: 792 }); }

                doc.fillColor(this.colors.primary).fontSize(22).font('Helvetica-Bold').text('DETALLE DEL ARRIENDO', 50, 40);
                
                doc.fillColor('#666666').fontSize(10).font('Helvetica');
                let infoY = 75;
                doc.text(`CLIENTE: ${clientFullName}`, 50, infoY);
                doc.text(`SERIE: ${cot.num_arriendo || cot.num}`, 300, infoY);
                infoY += 15;
                doc.text(`FECHA SALIDA: ${this.formatDate(cot.fevent)}`, 50, infoY);
                doc.text(`FECHA REGRESO: ${this.formatDate(cot.fevent_fin)}`, 300, infoY);

                let y = 120;
                doc.fontSize(10).font('Helvetica-Bold').fillColor(this.colors.primary).text('ARTÍCULOS Y SERVICIOS', 50, y);
                y += 18;
                doc.strokeColor(this.colors.primary).lineWidth(1).moveTo(50, y).lineTo(580, y).stroke();
                y += 10;

                detalles.forEach(item => {
                    if (y > 600) { doc.addPage(); y = 50; }
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(item.nombre.toUpperCase(), 60, y, { width: 340 });
                    doc.fontSize(10).font('Helvetica').text(Math.floor(item.cantidad).toString(), 410, y, { width: 30, align: 'center' });
                    doc.text(`$ ${this.formatCurrency(item.subtotal || (item.precio_u * item.cantidad))}`, 500, y, { width: 80, align: 'right' });
                    y += 18;
                });

                y += 20;
                if (cot.notas_entrega) {
                    if (y > 650) { doc.addPage(); y = 50; }
                    doc.fontSize(10).font('Helvetica-Bold').fillColor(this.colors.primary).text('ESTADO DE ENTREGA (SALIDA):', 50, y);
                    y += 14;
                    doc.fontSize(9).font('Helvetica').fillColor('#444').text(cot.notas_entrega, 50, y, { width: 500 });
                    y += doc.heightOfString(cot.notas_entrega, { width: 500 }) + 15;
                }

                if (cot.notas_devolucion) {
                    if (y > 650) { doc.addPage(); y = 50; }
                    doc.fontSize(10).font('Helvetica-Bold').fillColor(this.colors.primary).text('ESTADO DE DEVOLUCIÓN (REGRESO):', 50, y);
                    y += 14;
                    doc.fontSize(9).font('Helvetica').fillColor('#444').text(cot.notas_devolucion, 50, y, { width: 500 });
                    y += doc.heightOfString(cot.notas_devolucion, { width: 500 }) + 15;
                }

                // TOTAL
                y = 680;
                doc.rect(380, y, 200, 60).fill(this.colors.primary);
                doc.fillColor('#ffffff').fontSize(12).font('Helvetica').text('TOTAL ARRIENDO', 395, y + 15);
                doc.fontSize(20).font('Helvetica-Bold').text(`$ ${this.formatCurrency(cot.monto_final)}`, 395, y + 30, { width: 170, align: 'right' });

                doc.end();

                stream.on('finish', () => {
                    db.query('UPDATE cotizaciones SET pdf_path = ? WHERE id = ?', [`/uploads/arriendos/${baseName}.pdf`, cotId]);
                    resolve({ path: filePath, name: baseName });
                });
                stream.on('error', reject);

            } catch (err) { reject(err); }
        });
    }

    _drawCoverPage(doc, cot, clientName, config) {
        const bgPath = path.join(this.assetsDir, 'cot_bgPort.png');
        if (fs.existsSync(bgPath)) {
            doc.image(bgPath, 0, 0, { width: 612, height: 792 });
        }

        doc.fillColor('#ffffff').fontSize(45).font('Helvetica-Bold');
        doc.text('COTIZACIÓN', 70, 450);
        
        doc.fontSize(16).font('Helvetica');
        doc.text('PREPARADA PARA:', 70, 500, { characterSpacing: 2 });
        
        doc.fillColor(this.colors.primary).fontSize(28).font('Helvetica-Bold');
        doc.text(clientName.toUpperCase(), 70, 525);

        doc.fillColor('#ffffff').fontSize(14).font('Helvetica');
        doc.text(`${cot.tipo_evento.toUpperCase()} • ${this.formatDate(cot.fevent)}`, 70, 565);
    }

    _drawAboutPage(doc) {
        const bgPath = path.join(this.assetsDir, 'cot_bgInfo.jpg');
        if (fs.existsSync(bgPath)) {
            doc.image(bgPath, 0, 0, { width: 612, height: 792 });
        }
        
        doc.fillColor(this.colors.primary).fontSize(40).font('Helvetica-Bold').text('SOBRE NOSOTROS', 50, 100);
        doc.fillColor('#333333').fontSize(12).font('Helvetica').text(
            'Somos expertos en la organización de eventos con más de 25 años de experiencia, especialistas como Wedding y Event Planner, creando y coordinando todo tipo de eventos, tanto sociales como corporativos a nivel local y nacional. Nos caracteriza un acompañamiento humano y profesional, en el que nos involucramos cuidadosamente en cada detalle para comprender sus sueños y expectativas, transformándolos en experiencias únicas, elegantes y memorables, cuidando cada detalle con responsabilidad, creatividad y pasión. Con el objetivo fiel de dejar siempre en su excelencia.',
            50, 160, { width: 320, align: 'justify', lineGap: 4 }
        );
    }

    _drawGalleryPage(doc, tipo) {
        const isBoda = tipo.toLowerCase().includes('boda') || tipo.toLowerCase().includes('matri');
        const imgName = isBoda ? 'boda.png' : 'bodano.png';
        const bgPath = path.join(this.assetsDir, imgName);
        if (fs.existsSync(bgPath)) { doc.image(bgPath, 0, 0, { width: 612, height: 792 }); }
    }

    _drawBudgetPage(doc, cot, detalles, config) {
        const bgPath = path.join(this.assetsDir, 'cot_bgPag.png');
        if (fs.existsSync(bgPath)) { doc.image(bgPath, 0, 0, { width: 612, height: 792 }); }

        doc.fillColor(this.colors.primary).fontSize(24).font('Helvetica-Bold').text('PRESUPUESTO DEL EVENTO', 50, 40);
        
        // Info Cliente
        doc.fillColor('#666666').fontSize(10).font('Helvetica');
        let infoY = 75;
        doc.text(`CLIENTE: ${cot.cl_nombre} ${cot.cl_apellido}`, 50, infoY);
        doc.text(`TIPO: ${cot.tipo_evento}`, 250, infoY);
        doc.text(`INVITADOS: ${cot.num_adultos + (cot.num_ninos || 0)}`, 450, infoY);
        infoY += 15;
        doc.text(`FECHA: ${this.formatDate(cot.fevent)}`, 50, infoY);
        doc.text(`LUGAR: ${cot.lugar || 'POR DEFINIR'}`, 250, infoY);

        // Agrupación por Categoría
        const grouped = detalles.reduce((acc, item) => {
            const cat = item.categoria || 'Servicios Generales';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        let y = 120;
        
        Object.entries(grouped).forEach(([cat, items]) => {
            if (y > 600) { doc.addPage(); y = 50; }
            
            doc.fontSize(11).font('Helvetica-Bold').fillColor(this.colors.primary).text(cat.toUpperCase(), 50, y);
            y += 18;
            doc.strokeColor(this.colors.primary).lineWidth(1).moveTo(50, y).lineTo(580, y).stroke();
            y += 10;

            items.forEach(item => {
                if (y > 650) { doc.addPage(); y = 50; }
                
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(item.nombre.toUpperCase(), 60, y, { width: 340 });
                doc.fontSize(10).font('Helvetica').text(Math.floor(item.cantidad).toString(), 410, y, { width: 30, align: 'center' });
                doc.text(`$ ${this.formatCurrency(item.subtotal || (item.precio_u * item.cantidad))}`, 500, y, { width: 80, align: 'right' });
                
                if (item.notas) {
                    y += 13;
                    doc.fontSize(8).font('Helvetica').fillColor('#888888').text(item.notas, 60, y, { width: 340 });
                }
                y += 20;
            });
            y += 15;
        });

        // Totales y Políticas al final
        if (y > 600) { doc.addPage(); y = 50; }
        
        // Políticas
        doc.fontSize(9).font('Helvetica-Bold').fillColor(this.colors.primary).text('POLÍTICAS DE LA OFERTA', 50, y);
        y += 15;
        const politicas = [
            'La vigencia de la oferta tiene un periodo de 15 días calendario a partir de su elaboración.',
            'Monto sujeto a cambio, según reajuste de precios a la fecha del Evento.',
            'El monto total no incluye el IVA.',
            'Monto no incluye Deposito.'
        ];
        politicas.forEach(p => {
            doc.fontSize(8).font('Helvetica').fillColor('#666666').text(`• ${p}`, 50, y);
            y += 12;
        });

        // Cuadro de Inversión
        y = 680;
        doc.rect(380, y, 200, 60).fill(this.colors.primary);
        doc.fillColor('#ffffff').fontSize(12).font('Helvetica').text('INVERSIÓN TOTAL', 395, y + 15);
        doc.fontSize(20).font('Helvetica-Bold').text(`$ ${this.formatCurrency(cot.monto_final)}`, 395, y + 30, { width: 170, align: 'right' });
    }

    _drawAdditionalPage(doc, detalles, config) {
        const bgPath = path.join(this.assetsDir, 'cot_bgEfect.png');
        if (fs.existsSync(bgPath)) { doc.image(bgPath, 0, 0, { width: 612, height: 792 }); }

        doc.fillColor(this.colors.primary).fontSize(24).font('Helvetica-Bold').text('SERVICIOS ADICIONALES', 50, 50);
        
        let y = 100;
        const extras = detalles.filter(d => d.es_adicional);
        doc.fillColor('#333333').font('Helvetica').fontSize(11);

        if (extras.length === 0) {
            doc.text('Explora nuestra amplia gama de servicios complementarios para hacer tu evento aún más especial.', 50, y, { width: 350 });
        } else {
            extras.forEach(item => {
                doc.font('Helvetica-Bold').text(`${item.nombre}`, 50, y);
                doc.font('Helvetica').fontSize(10).text(`$ ${this.formatCurrency(item.precio_u)}`, 500, y, { align: 'right' });
                y += 20;
            });
        }
    }

    _drawContactPage(doc, config) {
        const bgPath = path.join(this.assetsDir, 'cot_bgContacto.png');
        if (fs.existsSync(bgPath)) { doc.image(bgPath, 0, 0, { width: 612, height: 792 }); }

        doc.fillColor('#ffffff').fontSize(35).font('Helvetica-Bold').text('TRABAJEMOS JUNTOS', 50, 580);
        doc.fontSize(13).font('Helvetica').text(config.web || 'www.archiplanner.com.co', 50, 625);
        doc.text(config.telefono || '315 707 1830', 50, 645);
        doc.text(config.email_contacto || 'hola@archiplanner.com.co', 50, 665);
    }

    async generateContractPDF(cotId) {
        return new Promise(async (resolve, reject) => {
            try {
                const [rows] = await db.query(`
                    SELECT c.*, cl.nombre as cl_nombre, cl.apellido as cl_apellido, cl.correo as cl_correo, cl.telefono as cl_telefono, 
                           cl.documento as cl_cedula, cl.ciudad_cedula as cl_ciudad_cedula
                    FROM cotizaciones c
                    JOIN clientes cl ON c.cli_id = cl.id
                    WHERE c.id = ?
                `, [cotId]);

                if (rows.length === 0) throw new Error('Cotización no encontrada');
                const cot = rows[0];
                
                const [configRows] = await db.query('SELECT * FROM configuracion LIMIT 1');
                const config = configRows[0] || {};

                const [detalles] = await db.query('SELECT * FROM cotizacion_detalles WHERE cot_id = ?', [cotId]);
                const [pagos] = await db.query('SELECT * FROM pagos WHERE cot_id = ? AND estado = "completado"', [cotId]);

                const clientFullName = `${cot.cl_nombre} ${cot.cl_apellido}`;
                const baseName = `CONTRATO • ${this.generateStandardName(cot.fevent, cot.tipo_evento, clientFullName)}`;
                const filePath = path.join(this.baseDir, 'contratos', baseName + '.pdf');

                if (!fs.existsSync(path.join(this.baseDir, 'contratos'))) fs.mkdirSync(path.join(this.baseDir, 'contratos'), { recursive: true });

                const doc = new PDFDocument({ size: 'LETTER', margins: { top: 70, left: 70, bottom: 70, right: 70 } });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- HEADER ---
                doc.fontSize(10).font('Helvetica-Bold').text('CONTRATO', { align: 'left', continued: true });
                doc.font('Helvetica').text(' | ARCHIPLANNER', { align: 'right' });
                doc.strokeColor('#000').lineWidth(2).moveTo(70, 85).lineTo(542, 85).stroke();
                doc.moveDown(3);

                doc.fontSize(16).font('Helvetica-Bold').text('CONTRATO DE PRESTACIÓN DE SERVICIOS', { align: 'center' });
                doc.moveDown(1.5);

                const hoy = new Date();
                const anticipoReal = Math.max(pagos.reduce((acc, p) => acc + Number(p.monto), 0), Number(cot.anticipo || 0));
                const saldoReal = Number(cot.monto_final || 0) - anticipoReal;

                // INTRODUCCIÓN
                doc.fontSize(11).font('Helvetica').text(
                    `Entre los suscritos; ${clientFullName.toUpperCase()}, identificado con cédula de ciudadanía número ${cot.cl_cedula || '____________________'}, expedida en ${cot.cl_ciudad_cedula || '____________________'} quien para efectos de este contrato se denominará EL CONTRATANTE por una parte, y ${config.ceo || 'LUIS MANUEL ARCHILA CASTILLO'}, identificado con número ${config.cedula || '1.414.685'}, expedida en ${config.ciudad_expedicion || 'Bogotá'} quien para efectos de este contrato se denominará EL CONTRATISTA, hemos convenido celebrar el presente contrato de prestación de servicios y alquiler de un salón social, mobiliario, decoración y servicio de catering, el cual se regirá por las siguientes cláusulas:`,
                    { align: 'justify', lineGap: 3 }
                );
                doc.moveDown();

                // CLÁUSULAS
                const drawClause = (title, body) => {
                    doc.font('Helvetica-Bold').text(title, { continued: true });
                    doc.font('Helvetica').text(` - ${body}`, { align: 'justify', lineGap: 2 });
                    doc.moveDown(0.8);
                };

                drawClause('PRIMERA. - OBJETO DEL CONTRATO:', 'Prestar los servicios de alquiler de un salón social, mobiliario, decoración y servicio de catering; para la preparación, organización, montaje y acompañamiento de un evento de encuentro social.');
                
                drawClause('SEGUNDA. - ALCANCE DEL OBJETO:', `EL CONTRATISTA se compromete el día ${this.formatDate(cot.fevent)} a prestar el servicio del evento.`);

                drawClause('PARÁGRAFO 1. - HORARIO DE PRESTACION DE SERVICIOS:', `La prestación de servicios se limitará estrictamente al horario del evento, desde las ${this.formatTime(cot.hora_inicio)} del ${new Date(cot.fevent).toLocaleDateString()} hasta las ${this.formatTime(cot.hora_fin)} del ${new Date(cot.fevent_fin || cot.fevent).toLocaleDateString()}.`);

                drawClause('PARÁGRAFO 2. - ESTADO DE LOS ELEMENTOS:', 'Los elementos, materiales y utensilios se entregarán contados y se verificará el estado en el que se entregan. En caso de daño o pérdida, el CONTRATANTE realizará el pago de los mismos.');

                // Tabla simplificada en el contrato
                let y = doc.y;
                doc.fontSize(9).font('Helvetica-Bold');
                doc.text('CANT', 70, y); doc.text('DESCRIPCION', 120, y);
                y += 12;
                detalles.slice(0, 10).forEach(item => {
                    doc.fontSize(9).font('Helvetica').text(Math.floor(item.cantidad).toString(), 70, y);
                    doc.text(item.nombre.toUpperCase(), 120, y, { width: 400 });
                    y += 12;
                });
                doc.y = y + 10;

                drawClause('TERCERA. - LUGAR DE EJECUCIÓN:', `El contrato se ejecutará en las instalaciones de ${cot.lugar || 'POR DEFINIR'}.`);

                drawClause('QUARTA. - VALOR Y FORMA DE PAGO:', `El contrato tendrá un valor total de $ ${this.formatCurrency(cot.monto_final)} (${numeroALetras(cot.monto_final)}) M/C. Anticipo: $ ${this.formatCurrency(anticipoReal)} (${numeroALetras(anticipoReal)}), usado para apartar la fecha. Saldo: $ ${this.formatCurrency(saldoReal)} (${numeroALetras(saldoReal)}), a cancelar 8 días antes del evento.`);

                drawClause('QUINTA. - CLÁUSULA PENAL:', 'En caso de incumplimiento, la parte incumplida cancelará el equivalente al 50% del valor total del contrato.');

                drawClause('SEXTA. - AUSENCIA DE RELACIÓN LABORAL:', 'El contrato se ejecuta con absoluta autonomía, sin generar vínculo laboral alguno.');

                drawClause('SÉPTIMA. - MODIFICACIONES:', 'Las cantidades podrán modificarse hasta una semana antes del evento.');

                drawClause('OCTAVA. - EXCLUSIÓN DE RESPONSABILIDADES:', 'EL CONTRATANTE excluye de todos los daños no atribuibles directamente al contratista.');

                drawClause('NOVENA. - DEPOSITO POR DAÑOS:', 'EL CONTRATANTE debe dejar un depósito de garantía que será reembolsado tras la verificación del salón y elementos.');

                drawClause('DÉCIMA. - SUPERVISIÓN:', 'El CONTRATANTE supervisará la ejecución y podrá formular observaciones.');

                drawClause('DÉCIMA PRIMERA. - TERMINACIÓN:', 'Terminará por acuerdo mutuo o incumplimiento de obligaciones industriales o de salud.');

                drawClause('DÉCIMA SEGUNDA. - INDEPENDENCIA:', 'El CONTRATISTA actuará por su cuenta y riesgo.');

                drawClause('DÉCIMA TERCERA. - CESIÓN:', 'No se podrá ceder el contrato sin autorización previa y escrita.');

                drawClause('DÉCIMA CUARTA. - SUBCONTRATACIÓN:', 'El CONTRATISTA puede subcontratar personal bajo su responsabilidad.');

                drawClause('DÉCIMA QUINTA. - DOMICILIO:', `Ciudad de BUCARAMANGA en la dirección ${config.direccion || 'Crr. 17F, #58A - 49'}.`);

                drawClause('DÉCIMA SEXTA. - FALLECIMIENTO:', 'Dará lugar a la finalización del contrato hasta el día del deceso.');

                drawClause('DÉCIMA SÉPTIMA. - ANEXOS:', 'Se anexa cotización detallada de productos y servicios.');

                doc.moveDown(2);
                doc.text(`Las partes suscriben el presente documento a los ${hoy.getDate()} días del mes de ${hoy.toLocaleDateString('es-CO', { month: 'long' })} de ${hoy.getFullYear()}, en la ciudad de Bucaramanga.`, { align: 'justify' });

                // FIRMAS
                doc.moveDown(4);
                let currentY = doc.y;
                doc.strokeColor('#000').lineWidth(1).moveTo(70, currentY).lineTo(250, currentY).stroke();
                doc.strokeColor('#000').lineWidth(1).moveTo(350, currentY).lineTo(530, currentY).stroke();
                
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text(clientFullName, 70, currentY + 10, { width: 180, align: 'center' });
                doc.text(config.ceo || 'LUIS MANUEL ARCHILA', 350, currentY + 10, { width: 180, align: 'center' });
                
                doc.font('Helvetica').fontSize(9);
                doc.text('EL CONTRATANTE', 70, currentY + 25, { width: 180, align: 'center' });
                doc.text('EL CONTRATISTA', 350, currentY + 25, { width: 180, align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    db.query('UPDATE cotizaciones SET contrato_path = ? WHERE id = ?', [`/uploads/contratos/${baseName}.pdf`, cotId]);
                    resolve({ path: filePath, name: baseName });
                });
                stream.on('error', reject);
            } catch(err) { reject(err); }
        });
    }

    async generateItineraryPDF(cotId) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Obtener Datos
                const [rows] = await db.query(`
                    SELECT c.*, cl.nombre as cl_nombre, cl.apellido as cl_apellido, cl.telefono as cl_telefono
                    FROM cotizaciones c
                    JOIN clientes cl ON c.cli_id = cl.id
                    WHERE c.id = ?
                `, [cotId]);

                if (rows.length === 0) throw new Error('Evento no encontrado');
                const cot = rows[0];
                
                const [itinerario] = await db.query('SELECT * FROM event_itinerarios WHERE cot_id = ? ORDER BY hora ASC, orden ASC', [cotId]);
                const [configRows] = await db.query('SELECT * FROM configuracion LIMIT 1');
                const config = configRows[0] || {};

                const clientFullName = `${cot.cl_nombre} ${cot.cl_apellido}`;
                const baseName = `ITINERARIO • ${this.generateStandardName(cot.fevent, cot.tipo_evento, clientFullName)}`;
                const filePath = path.join(this.baseDir, 'itinerarios', baseName + '.pdf');

                if (!fs.existsSync(path.join(this.baseDir, 'itinerarios'))) fs.mkdirSync(path.join(this.baseDir, 'itinerarios'), { recursive: true });

                // 2. Iniciar Documento (HORIZONTAL)
                const doc = new PDFDocument({ 
                    size: 'LETTER', 
                    layout: 'landscape',
                    margins: { top: 40, left: 40, bottom: 40, right: 40 } 
                });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- HEADER (Spreadsheet Style) ---
                const drawField = (label, val, x, y, w) => {
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('#666').text(label.toUpperCase(), x, y);
                    doc.fontSize(10).font('Helvetica').fillColor('#333').text(val || '-', x, y + 10, { width: w });
                };

                doc.fontSize(16).font('Helvetica-Bold').fillColor(this.colors.primary).text('ITINERARIO DEL EVENTO', 40, 40);
                doc.fontSize(10).font('Helvetica').fillColor('#888').text('ARCHIPLANNER CRM v5.3', 600, 40, { align: 'right' });
                
                doc.rect(40, 65, 712, 1).fill(this.colors.primary);
                
                let curY = 80;
                drawField('Cliente', clientFullName, 40, curY, 200);
                drawField('Teléfono', cot.cl_telefono, 250, curY, 100);
                drawField('Fecha Evento', this.formatDate(cot.fevent), 370, curY, 150);
                drawField('Pax (Adultos/Niños)', `${cot.num_adultos} / ${cot.num_ninos || 0}`, 540, curY, 100);
                drawField('Lugar', cot.lugar || 'Por definir', 660, curY, 100);

                curY += 35;
                drawField('Tipo Evento', cot.tipo_evento, 40, curY, 200);
                drawField('Inicio', this.formatTime(cot.hora_inicio), 250, curY, 100);
                drawField('Fin', this.formatTime(cot.hora_fin), 370, curY, 100);
                drawField('Paleta', cot.colores || 'Por definir', 490, curY, 150);

                // --- TABLE HEADER ---
                curY += 50;
                const colWidths = { hora: 70, actividad: 150, desc: 250, recursos: 142, resp: 100 };
                const startX = 40;

                doc.rect(startX, curY, 712, 20).fill(this.colors.dark);
                doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
                doc.text('HORA', startX + 5, curY + 6);
                doc.text('ACTIVIDAD', startX + colWidths.hora + 5, curY + 6);
                doc.text('DESCRIPCION', startX + colWidths.hora + colWidths.actividad + 5, curY + 6);
                doc.text('RECURSOS', startX + colWidths.hora + colWidths.actividad + colWidths.desc + 5, curY + 6);
                doc.text('RESPONSABLE', startX + colWidths.hora + colWidths.actividad + colWidths.desc + colWidths.recursos + 5, curY + 6);

                curY += 20;
                doc.fillColor('#333').font('Helvetica').fontSize(9);

                // --- TABLE ROWS ---
                itinerario.forEach((item, idx) => {
                    const rowHeight = Math.max(
                        doc.heightOfString(item.descripcion || '', { width: colWidths.desc - 10 }),
                        doc.heightOfString(item.recursos || '', { width: colWidths.recursos - 10 }),
                        25
                    ) + 10;

                    if (curY + rowHeight > 550) {
                        doc.addPage({ size: 'LETTER', layout: 'landscape' });
                        curY = 40;
                        // Redraw header if needed or simplified row start
                    }

                    // Background zebra
                    if (idx % 2 === 0) {
                        doc.rect(startX, curY, 712, rowHeight).fill('#f9f9f9');
                    }
                    doc.rect(startX, curY, 712, rowHeight).strokeColor('#eeeeee').lineWidth(0.5).stroke();

                    doc.fillColor('#333').text(this.formatTime(item.hora), startX + 5, curY + 8);
                    doc.font('Helvetica-Bold').text(item.titulo, startX + colWidths.hora + 5, curY + 8, { width: colWidths.actividad - 10 });
                    doc.font('Helvetica').text(item.descripcion || '-', startX + colWidths.hora + colWidths.actividad + 5, curY + 8, { width: colWidths.desc - 10 });
                    doc.text(item.recursos || '-', startX + colWidths.hora + colWidths.actividad + colWidths.desc + 5, curY + 8, { width: colWidths.recursos - 10 });
                    doc.text(item.responsable || '-', startX + colWidths.hora + colWidths.actividad + colWidths.desc + colWidths.recursos + 5, curY + 8, { width: colWidths.resp - 10 });

                    curY += rowHeight;
                });

                doc.end();

                stream.on('finish', () => {
                    resolve({ path: filePath, name: baseName });
                });
                stream.on('error', reject);
            } catch (err) { reject(err); }
        });
    }
}

module.exports = new DocumentService();
