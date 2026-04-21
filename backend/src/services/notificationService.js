const db = require('../db');
const nodemailer = require('nodemailer');
const pushService = require('./pushService');

/**
 * Notification Service
 * Handles creation of database alerts and sending email notifications to admins.
 */
class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
            port: process.env.EMAIL_PORT || 465,
            secure: true, // true para 465, false para otros
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    /**
     * Enviar Correo a Cliente con Adjunto
     */
    async sendClientEmail({ to, subject, html, attachments = [] }) {
        try {
            const mailOptions = {
                from: `"ArchiPlanner" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <div style="background: #1a1a1a; padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
                             <h1 style="color: #B76E79; margin: 0;">ArchiPlanner</h1>
                        </div>
                        <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 15px 15px;">
                            ${html}
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="font-size: 11px; color: #999;">Esta es una notificación automática. Por favor no respondas a este correo.</p>
                        </div>
                    </div>
                `,
                attachments
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('[NotificationService] Client email sent:', info.messageId);
            return true;
        } catch (err) {
            console.error('[NotificationService] Error sending client email:', err.message);
            return false;
        }
    }

    /**
     * Create a database alert
     */
    async createAlert({ titulo, mensaje, tipo, relacionada_a, tabla_relacionada, u_id = null }) {
        try {
            const [result] = await db.query(
                'INSERT INTO alertas (titulo, mensaje, tipo, relacionada_a, tabla_relacionada, leida) VALUES (?, ?, ?, ?, ?, ?)',
                [titulo, mensaje, tipo, relacionada_a, tabla_relacionada, 0]
            );

            // Trigger Push Notification
            await pushService.sendNotification({
                title: titulo,
                body: mensaje,
                icon: '/icons/bell-alert.png', // Fallback or dynamic
                data: {
                    url: '/admin/calendar', // Default as per centralization request
                    tipo
                }
            });

            return result.insertId;
        } catch (err) {
            console.error('[NotificationService] Error creating alert:', err.message);
            return null;
        }
    }

    /**
     * Send email to site administrator
     */
    async sendAdminEmail(subject, htmlContent) {
        try {
            const [configRows] = await db.query('SELECT email_contacto FROM configuracion WHERE es_activa = 1 LIMIT 1');
            const adminEmail = configRows.length > 0 ? configRows[0].email_contacto : process.env.EMAIL_USER;

            if (!adminEmail) return;

            const mailOptions = {
                from: `"ArchiPlanner Notifications" <${process.env.EMAIL_USER}>`,
                to: adminEmail,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">ArchiPlanner Notification</h2>
                        ${htmlContent}
                        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #888;">Este es un mensaje automático del sistema ArchiPlanner.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('[NotificationService] Email sent to:', adminEmail);
        } catch (err) {
            console.error('[NotificationService] Error sending email:', err.message);
        }
    }

    /**
     * Trigger a new client alert
     */
    async notifyNewClient(cliente) {
        const titulo = `🆕 Nuevo Cliente: ${cliente.nombre}`;
        const mensaje = `Un nuevo cliente se ha registrado: ${cliente.nombre} ${cliente.apellido || ''}. \nNecesidad: ${cliente.necesidad || 'No especificada'}`;
        
        await this.createAlert({
            titulo,
            mensaje,
            tipo: 'nuevo_cliente',
            relacionada_a: cliente.id,
            tabla_relacionada: 'clientes'
        });

        await this.sendAdminEmail(
            `🚀 Nuevo Cliente Registrado: ${cliente.nombre}`,
            `
            <h3>Detalles del Registro:</h3>
            <ul>
                <li><strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellido || ''}</li>
                <li><strong>Email:</strong> ${cliente.email}</li>
                <li><strong>Teléfono:</strong> ${cliente.telefono || 'N/A'}</li>
                <li><strong>Necesidad:</strong> ${cliente.necesidad || 'No especificada'}</li>
            </ul>
            <p>Accede al panel administrativo para gestionar este prospecto.</p>
            `
        );
    }

    /**
     * Trigger a new survey alert
     */
    async notifyNewSurvey(encuesta) {
        const titulo = `⭐ Nueva Evaluación: ${encuesta.nombre_cliente}`;
        const mensaje = `${encuesta.nombre_cliente} ha calificado su experiencia con ${encuesta.rating_general} estrellas. \nTestimonio: ${encuesta.testimonio ? encuesta.testimonio.substring(0, 50) + '...' : 'Sin texto'}`;
        
        await this.createAlert({
            titulo,
            mensaje,
            tipo: 'nuevo_testimonio',
            relacionada_a: encuesta.id,
            tabla_relacionada: 'encuestas_satisfaccion'
        });

        await this.sendAdminEmail(
            `🌟 Nueva Calificación de Cliente: ${encuesta.nombre_cliente}`,
            `
            <h3>Detalles de la Evaluación:</h3>
            <ul>
                <li><strong>Cliente:</strong> ${encuesta.nombre_cliente}</li>
                <li><strong>Calificación General:</strong> ${encuesta.rating_general} / 5</li>
                <li><strong>Profesionalismo:</strong> ${encuesta.rating_profesionalismo} / 5</li>
                <li><strong>Calidad:</strong> ${encuesta.rating_calidad} / 5</li>
                <li><strong>Testimonio:</strong> "${encuesta.testimonio || 'Sin mensaje'}"</li>
                <li><strong>Multimedia:</strong> ${encuesta.foto_path ? '📷 Incluye foto' : 'Sin foto'} ${encuesta.audio_path ? '🎤 Incluye audio' : 'Sin audio'}</li>
            </ul>
            <p>Revisa el material en el panel de testimonios para publicarlo.</p>
            `
        );
    }

    /**
     * Triggered scan for expiring quotes and debt events
     * Should be called 2x daily
     */
    async runDailyChecks() {
        console.log('[NotificationService] Starting daily checks...');
        
        // 1. Check for Expiring Quotes (15 days validity)
        // Quotes created 13-14 days ago that are still 'enviada'
        const [expiringQuotes] = await db.query(`
            SELECT c.*, cli.nombre as cliente_nombre, cli.correo 
            FROM cotizaciones c
            JOIN clientes cli ON c.cli_id = cli.id
            WHERE c.estado = 'enviada' 
            AND DATEDIFF(NOW(), c.fcoti) BETWEEN 13 AND 15
        `);

        for (const quote of expiringQuotes) {
            await this.createAlert({
                titulo: `⚠️ Cotización por vencer: ${quote.num}`,
                mensaje: `La cotización ${quote.num} para ${quote.cliente_nombre} vence pronto (FCrea: ${quote.fcoti}).`,
                tipo: 'recordatorio',
                relacionada_a: quote.id,
                tabla_relacionada: 'cotizaciones'
            });
        }

        // 2. Check for Events in 1 week with debt
        const [debtEvents] = await db.query(`
            SELECT cli.id, cli.nombre, cli.apellido, cli.fevento, cli.presupuesto, 
                   IFNULL((SELECT SUM(monto) FROM pagos WHERE cot_id IN (SELECT id FROM cotizaciones WHERE cli_id = cli.id) AND estado = 'completado'), 0) as total_pagado
            FROM clientes cli
            WHERE cli.fevento IS NOT NULL 
            AND DATEDIFF(cli.fevento, NOW()) = 7
        `);

        for (const event of debtEvents) {
            if (event.total_pagado < event.presupuesto) {
                const balance = event.presupuesto - event.total_pagado;
                await this.createAlert({
                    titulo: `💰 Saldo Pendiente: ${event.nombre}`,
                    mensaje: `El evento de ${event.nombre} es en 1 semana y aún debe $${balance.toLocaleString()}.`,
                    tipo: 'pago_vencido',
                    relacionada_a: event.id,
                    tabla_relacionada: 'clientes'
                });
                
                await this.sendAdminEmail(
                    `⚠️ Saldo Pendiente: Evento Próximo de ${event.nombre}`,
                    `
                    <p>El evento de <strong>${event.nombre} ${event.apellido || ''}</strong> está programado para el <strong>${event.fevento}</strong> (en 1 semana).</p>
                    <p><strong>Estado Financiero:</strong></p>
                    <ul>
                        <li>Presupuesto Total: $${event.presupuesto.toLocaleString()}</li>
                        <li>Total Pagado: $${event.total_pagado.toLocaleString()}</li>
                        <li style="color: red;">Saldo Pendiente: $${balance.toLocaleString()}</li>
                    </ul>
                    `
                );
            }
        }
        
        console.log('[NotificationService] Daily checks completed.');
    }
}

module.exports = new NotificationService();
