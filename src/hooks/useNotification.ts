import { useState, useCallback, useEffect } from 'react';
import { messaging, getToken, functions, httpsCallable } from '../lib/firebase';

export const useNotification = () => {
    const [fcmToken, setFcmToken] = useState<string>('');
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const requestToken = useCallback(async () => {
        try {
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                setPermissionStatus(permission);
                if (permission !== 'granted') return null;
            }

            const registration = await navigator.serviceWorker.ready;
            const token = await getToken(messaging, {
                serviceWorkerRegistration: registration,
                vapidKey: "BOtcb549zlm2Dg5qSyjAunURFku8H5Skgm21ekxka9ogNYrXY4ev4hxLzdVGx8hT-TagAarL57f1KJnPhlpdTgQ"
            });

            if (token) {
                setFcmToken(token);
                // Also save to localStorage for persistence if needed, 
                // but getToken typically handles caching well.
                return token;
            }
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
        return null;
    }, []);

    // Initial check on mount
    useEffect(() => {
        if (Notification.permission === 'granted') {
            requestToken();
        }
    }, [requestToken]);

    const sendPushNotification = useCallback(async (title: string, body: string) => {
        if (!fcmToken) {
            console.warn('No FCM token available to send notification');
            return;
        }

        try {
            const sendFn = httpsCallable(functions, 'sendNotification');
            await sendFn({
                token: fcmToken,
                title,
                body
            });
            console.log('Push notification sent successfully');
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }, [fcmToken]);

    return {
        fcmToken,
        permissionStatus,
        requestToken,
        sendPushNotification
    };
};
