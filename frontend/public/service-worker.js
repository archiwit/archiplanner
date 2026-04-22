/* eslint-disable no-restricted-globals */

// Service Worker for ArchiPlanner Push Notifications
self.addEventListener('push', (event) => {
    let data = { title: 'ArchiPlanner', body: 'Nueva notificación' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'ArchiPlanner', body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        data: data.data || {},
        vibrate: [100, 50, 100],
        actions: [
            { action: 'open', title: 'Ver ahora' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Default URL to open
    const urlToOpen = event.notification.data.url || '/admin/calendar';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window found, open a new one
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
