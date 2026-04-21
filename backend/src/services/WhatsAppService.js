const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.baseUrl = `https://graph.facebook.com/${process.env.WABA_VERSION || 'v20.0'}`;
        this.token = process.env.WABA_TOKEN;
        this.phoneId = process.env.WABA_PHONE_ID;
    }

    async sendMessage(to, message) {
        if (!this.token || !this.phoneId) {
            console.warn('[WhatsAppService] Meta API no configurada en .env. Saltando envío.');
            return false;
        }

        try {
            const cleanPhone = to.replace(/\D/g, '');
            const response = await axios.post(
                `${this.baseUrl}/${this.phoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'text',
                    text: { body: message }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return true;
        } catch (err) {
            console.error('[WhatsAppService] Error enviando mensaje:', 
                err.response ? JSON.stringify(err.response.data) : err.message
            );
            return false;
        }
    }

    /**
     * Enviar un documento (PDF) mediante WhatsApp
     * @param {string} to - Número destino
     * @param {string} fileUrl - URL pública del archivo
     * @param {string} filename - Nombre mostrado del archivo
     */
    async sendDocument(to, fileUrl, filename) {
        if (!this.token || !this.phoneId) return false;

        try {
            const cleanPhone = to.replace(/\D/g, '');
            await axios.post(
                `${this.baseUrl}/${this.phoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'document',
                    document: {
                        link: fileUrl,
                        filename: filename
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return true;
        } catch (err) {
            console.error('[WhatsAppService] Error enviando documento:', 
                err.response ? JSON.stringify(err.response.data) : err.message
            );
            return false;
        }
    }

    /**
     * Enviar notificación de pago aprobado (Usando el esquema de ArchiPlanner)
     */
    async notifyPaymentApproved(cliente, pagoMonto, reciboPublicUrl) {
        const mensaje = `¡Hola ${cliente.nombre}! 👋 Tu pago por $${Number(pagoMonto).toLocaleString()} ha sido aprobado. \n\nPuedes descargar tu recibo aquí: ${process.env.WEB_URL || 'http://localhost:5173'}${reciboPublicUrl}\n\nGracias por confiar en ArchiPlanner.`;
        return this.sendMessage(cliente.telefono, mensaje);
    }
}

module.exports = new WhatsAppService();
