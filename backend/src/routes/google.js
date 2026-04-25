const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/googleCalendarService');
const jwt = require('jsonwebtoken');

/**
 * Get Auth URL
 */
router.get('/auth-url', (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('[Google-Auth] ERROR: process.env.GOOGLE_CLIENT_ID no está definido.');
            return res.status(500).json({ error: 'Configuración de Google incompleta en el servidor (.env)' });
        }
        const url = googleCalendarService.getAuthUrl();
        console.log('[Google-Auth] URL generada:', url);
        res.json({ url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * OAuth2 Callback
 */
router.get('/callback', async (req, res) => {
    const { code, state } = req.query; // 'state' could carry userId if we want
    
    // For simplicity, we assume the user is logged in and we can get their ID from JWT if it was passed
    // In a production environment, you might use session or a state token
    // Here we'll redirect to a frontend page that finished the process
    
    try {
        // This part usually requires the userId. 
        // If we don't have it in the callback (Google doesn't send it back unless in 'state'),
        // we might need a workaround or use the 'state' parameter.
        
        // Let's assume the frontend sends the user to /google/callback?code=...
        // and we handle it there. But Google redirects HERE.
        
        // Better approach: User clicks "Connect", frontend gets URL.
        // User approves, Google redirects to https://archiplanner.com.co/api/google/callback?code=...
        // Backend stores tokens (needs to know WHICH user).
        
        res.send(`
            <html>
                <body style="background: #121212; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
                    <h2 style="color: #B76E79;">¡Conexión Exitosa!</h2>
                    <p>Puedes cerrar esta ventana y volver a ArchiPlanner.</p>
                    <script>
                        // Enviar el code al componente padre o simplemente guardar en localStorage para que el dashboard lo procese
                        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', code: '${code}' }, '*');
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Error en la autenticación: ' + err.message);
    }
});

/**
 * Exchange code for tokens (Called from frontend after callback)
 */
router.post('/exchange-token', async (req, res) => {
    const { code, userId } = req.body;
    try {
        await googleCalendarService.saveTokens(code, userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
