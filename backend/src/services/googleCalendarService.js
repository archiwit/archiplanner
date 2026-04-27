const { google } = require('googleapis');
const db = require('../db');

/**
 * Helper to get a configured OAuth2 client
 */
const getClient = () => {
    // Si estamos en desarrollo local, usamos localhost
    // Si estamos en producción, usamos la variable de entorno o un fallback seguro
    const isLocal = process.env.NODE_ENV === 'development' || process.env.DB_HOST === '127.0.0.1';
    
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || (
        isLocal 
        ? 'http://localhost:5001/api/google/callback' 
        : 'https://archiplanner-api.onrender.com/api/google/callback'
    );
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('[Google-Auth] ERROR: Faltan credenciales de Google en el servidor.');
    }

    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );
};

const googleCalendarService = {
    /**
     * Get the Auth URL for the user to sign in
     */
    getAuthUrl() {
        const client = getClient();
        const scopes = [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly'
        ];

        return client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent' // Force to get refresh token
        });
    },

    /**
     * Exchange code for tokens and save them to the user
     */
    async saveTokens(code, userId) {
        console.log(`[Google-Auth] Exchanging code for user: ${userId}`);
        const client = getClient();
        try {
            const { tokens } = await client.getToken(code);
            console.log(`[Google-Auth] Tokens received successfully`);
            
            const { access_token, refresh_token, expiry_date } = tokens;
            
            // Save to DB
            let sql = 'UPDATE usuarios SET google_access_token = ?, google_token_expiry = ?';
            let params = [access_token, expiry_date];
            
            if (refresh_token) {
                sql += ', google_refresh_token = ?';
                params.push(refresh_token);
            }
            
            sql += ' WHERE id = ?';
            params.push(userId);
            
            await db.query(sql, params);
            return tokens;
        } catch (error) {
            console.error(`[Google-Auth] Error exchanging code:`, error.response ? error.response.data : error.message);
            throw new Error(`Google Auth Failed: ${error.message}`);
        }
    },

    /**
     * Get authorized calendar instance for a user
     */
    async getCalendarInstance(userId) {
        const [rows] = await db.query(
            'SELECT google_access_token, google_refresh_token, google_token_expiry FROM usuarios WHERE id = ?',
            [userId]
        );

        if (!rows.length || !rows[0].google_access_token) {
            console.error(`[Google-Sync] No tokens found for user ${userId}`);
            return null;
        }

        const { google_access_token, google_refresh_token, google_token_expiry } = rows[0];

        const localOAuth = getClient();

        localOAuth.setCredentials({
            access_token: google_access_token,
            refresh_token: google_refresh_token,
            expiry_date: Number(google_token_expiry)
        });

        // Auto-refresh logic
        localOAuth.on('tokens', async (tokens) => {
            console.log(`[Google-Sync] New tokens received for user ${userId}`);
            if (tokens.access_token) {
                await db.query(
                    'UPDATE usuarios SET google_access_token = ?, google_token_expiry = ? WHERE id = ?',
                    [tokens.access_token, tokens.expiry_date, userId]
                );
            }
        });

        return google.calendar({ version: 'v3', auth: localOAuth });
    },

    /**
     * Sync one activity to Google Calendar
     */
    async syncEvent(userId, activityId) {
        try {
            const calendar = await this.getCalendarInstance(userId);
            if (!calendar) return null;

            const [rows] = await db.query('SELECT * FROM actividades WHERE id = ?', [activityId]);
            if (!rows.length) return null;

            const act = rows[0];
            const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

            // Función auxiliar para formatear fecha sin el sufijo 'Z' de UTC
            const formatForGoogle = (dateStr) => {
                const d = new Date(dateStr);
                const pad = (n) => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const event = {
                summary: act.titulo,
                description: act.descripcion || '',
                location: act.ubicacion || '',
                start: {
                    dateTime: formatForGoogle(act.fecha_inicio),
                    timeZone: 'America/Bogota',
                },
                end: {
                    dateTime: formatForGoogle(act.fecha_fin || act.fecha_inicio),
                    timeZone: 'America/Bogota',
                },
                colorId: this.mapColorToGoogle(act.color)
            };

            if (act.google_event_id) {
                // Update existing
                const res = await calendar.events.update({
                    calendarId,
                    eventId: act.google_event_id,
                    resource: event,
                });
                return res.data;
            } else {
                // Insert new
                console.log(`[Google-Sync] Inserting new event into calendar: ${calendarId}`);
                const res = await calendar.events.insert({
                    calendarId,
                    resource: event,
                });
                // Save google_event_id back to local activity
                await db.query('UPDATE actividades SET google_event_id = ? WHERE id = ?', [res.data.id, activityId]);
                console.log(`[Google-Sync] Success! Event ID: ${res.data.id}`);
                return res.data;
            }
        } catch (err) {
            console.error('[GOOGLE SYNC ERROR FULL]', err);
            throw err;
        }
    },

    /**
     * Delete event from Google
     */
    async deleteEvent(userId, googleEventId) {
        try {
            const calendar = await this.getCalendarInstance(userId);
            if (!calendar || !googleEventId) return;

            const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
            await calendar.events.delete({
                calendarId,
                eventId: googleEventId,
            });
        } catch (err) {
            console.error('[GOOGLE DELETE ERROR]', err.message);
        }
    },

    /**
     * Map HEX color to Google Calendar colorId
     */
    mapColorToGoogle(hex) {
        if (!hex) return '1';
        const color = hex.toLowerCase();
        
        // Mapeo exacto si usan la paleta de Google que añadiremos
        if (color === '#a4bdfc') return '1';  // Lavender
        if (color === '#7ae7bf') return '2';  // Sage
        if (color === '#dbadff') return '3';  // Grape
        if (color === '#ff887c') return '4';  // Flamingo
        if (color === '#fbd75b') return '5';  // Banana
        if (color === '#ffb878') return '6';  // Tangerine
        if (color === '#46d6db') return '7';  // Peacock
        if (color === '#e1e1e1') return '8';  // Graphite
        if (color === '#5484ed') return '9';  // Blueberry
        if (color === '#51b749') return '10'; // Basil
        if (color === '#dc2127') return '11'; // Tomato

        // Mapeo aproximado para otros colores
        if (color.includes('d32ed6')) return '3'; 
        if (color.includes('b76e79')) return '1'; 
        if (color.includes('green') || color === '#2ecc71') return '10'; 
        if (color.includes('blue') || color === '#3498db') return '9';  
        if (color.includes('red') || color === '#e74c3c') return '11';   
        if (color.includes('orange')) return '6'; 
        if (color.includes('yellow')) return '5'; 
        
        return '1'; 
    }
};

module.exports = googleCalendarService;
