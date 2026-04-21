const express = require('express');
const router = express.Router();
const pushService = require('../services/pushService');

/**
 * GET Public VAPID Key
 */
router.get('/vapid-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

/**
 * POST Store subscription
 */
router.post('/subscribe', async (req, res) => {
    const { userId, subscription } = req.body;
    const success = await pushService.subscribe(userId, subscription);
    if (success) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

/**
 * POST Test notification
 */
router.post('/test', async (req, res) => {
    const { userId, title, message } = req.body;
    await pushService.sendNotification({
        title: title || 'Test ArchiPlanner',
        body: message || 'Esta es una notificación de prueba.',
        icon: '/favicon.svg'
    }, userId);
    res.json({ success: true });
});

module.exports = router;
