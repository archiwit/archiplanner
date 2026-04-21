const webpush = require('web-push');
const db = require('../db');
require('dotenv').config();

// Configure VAPID keys
webpush.setVapidDetails(
    'mailto:' + (process.env.EMAIL_USER || 'admin@archiplanner.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

class PushService {
    /**
     * Store a new subscription
     */
    async subscribe(userId, subscription) {
        try {
            await db.query(
                'INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?)',
                [userId || null, JSON.stringify(subscription)]
            );
            return true;
        } catch (err) {
            console.error('[PushService] Error saving subscription:', err.message);
            return false;
        }
    }

    /**
     * Send a notification to all subscribers (or a specific user)
     */
    async sendNotification(payload, userId = null) {
        try {
            let query = 'SELECT subscription FROM push_subscriptions';
            let params = [];
            
            if (userId) {
                query += ' WHERE user_id = ?';
                params.push(userId);
            }

            const [rows] = await db.query(query, params);
            
            const results = await Promise.all(rows.map(async (row) => {
                const subscription = JSON.parse(row.subscription);
                try {
                    await webpush.sendNotification(subscription, JSON.stringify(payload));
                    return { success: true };
                } catch (err) {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        // Subscription has expired or is no longer valid
                        console.log('[PushService] Removing expired subscription');
                        await db.query('DELETE FROM push_subscriptions WHERE subscription = ?', [row.subscription]);
                    } else {
                        console.error('[PushService] Error sending notification:', err.message);
                    }
                    return { success: false, error: err.message };
                }
            }));

            return results;
        } catch (err) {
            console.error('[PushService] Error in broadcast:', err.message);
            return [];
        }
    }
}

module.exports = new PushService();
