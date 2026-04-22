import api from './api';

const pushService = {
    /**
     * Get the public VAPID key from the server
     */
    getPublicKey: async () => {
        const response = await api.get('/notifications/vapid-key');
        return response.data.publicKey;
    },

    /**
     * Subscribe the current user to push notifications
     */
    subscribeUser: async (userId) => {
        try {
            // 1. Check if service worker is supported
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('Push messaging is not supported');
                return false;
            }

            // 2. Wait for service worker to be ready
            const registration = await navigator.serviceWorker.ready;

            // 3. Get public key
            const publicKey = await pushService.getPublicKey();
            const uint8ArrayKey = pushService.urlBase64ToUint8Array(publicKey);

            // 4. Subscribe
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: uint8ArrayKey
            });

            // 5. Send subscription to server
            await api.post('/notifications/subscribe', {
                userId,
                subscription
            });

            console.log('Successfully subscribed to push notifications');
            return true;
        } catch (err) {
            console.error('Error subscribing to push:', err);
            return false;
        }
    },

    /**
     * Helper to convert base64 to Uint8Array
     */
    urlBase64ToUint8Array: (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
};

export default pushService;
