const { google } = require('googleapis');
const db = require('../db');

/**
 * Helper to get a configured OAuth2 client
 */
const getClient = () => {
    // URL dinámica basada en el entorno
    const isDev = process.env.NODE_ENV === 'development';
    const redirectUri = isDev 
        ? 'http://localhost:5001/api/google/callback' 
        : (process.env.GOOGLE_REDIRECT_URI || 'https://archiplanner.com.co/api/google/callback');
    
    console.log(`[Google-Auth] Usando Redirect URI (${isDev ? 'DEV' : 'PROD'}): ${redirectUri}`);
    
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
            return null;
        }

        const { google_access_token, google_refresh_token, google_token_expiry } = rows[0];

        const localOAuth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        localOAuth.setCredentials({
            access_token: google_access_token,
            refresh_token: google_refresh_token,
            expiry_date: Number(google_token_expiry)
        });

        // Auto-refresh logic
        localOAuth.on('tokens', async (tokens) => {
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

            const event = {
                summary: act.titulo,
                description: act.descripcion || '',
                location: act.ubicacion || '',
                start: {
                    dateTime: new Date(act.fecha_inicio).toISOString(),
                    timeZone: 'America/Bogota',
                },
                end: {
                    dateTime: new Date(act.fecha_fin || act.fecha_inicio).toISOString(),
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
                const res = await calendar.events.insert({
                    calendarId,
                    resource: event,
                });
                // Save google_event_id back to local activity
                await db.query('UPDATE actividades SET google_event_id = ? WHERE id = ?', [res.data.id, activityId]);
                return res.data;
            }
        } catch (err) {
            console.error('[GOOGLE SYNC ERROR]', err.message);
            return null;
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
     * Map HEX color to Google Calendar colorId (simplified)
     */
    mapColorToGoogle(hex) {
        // Google has 1-11 color IDs
        if (hex?.toLowerCase() === '#b76e79') return '1'; // Lavender-ish
        return '5'; // Banana (yellow) default
    }
};

module.exports = googleCalendarService;
