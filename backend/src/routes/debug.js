const express = require('express');
const router = express.Router();

router.get('/config-check', (req, res) => {
    res.json({
        has_client_id: !!process.env.GOOGLE_CLIENT_ID,
        client_id_prefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'MISSING',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'UNSET',
        node_env: process.env.NODE_ENV
    });
});

module.exports = router;
