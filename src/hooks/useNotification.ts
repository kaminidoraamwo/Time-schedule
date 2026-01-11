import { useState, useCallback, useEffect } from 'react';
import { messaging, getToken, functions, httpsCallable } from '../lib/firebase';
import { vapidKey } from '../config';

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
                vapidKey: vapidKey
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void requestToken();
        }
    }, [requestToken]);

    const sendPushNotification = useCallback(async (title: string, body: string) => {
        if (!fcmToken) return;
        try {
            const sendFn = httpsCallable(functions, 'sendNotification');
            await sendFn({ token: fcmToken, title, body });
            console.log('Push notification sent');
        } catch (error) {
            console.error('Error sending push:', error);
        }
    }, [fcmToken]);

    const schedulePushNotification = useCallback(async (title: string, body: string, delaySeconds: number): Promise<string | null> => {
        if (!fcmToken) return null;
        try {
            const scheduleFn = httpsCallable(functions, 'scheduleNotification');
            const result = await scheduleFn({ token: fcmToken, title, body, delaySeconds });
            const data = result.data as { success: boolean; taskName?: string };
            if (data.success && data.taskName) {
                console.log('Notification scheduled:', data.taskName);
                return data.taskName;
            }
        } catch (error) {
            console.error('Error scheduling push:', error);
        }
        return null;
    }, [fcmToken]);

    const cancelPushNotification = useCallback(async (taskName: string) => {
        try {
            const cancelFn = httpsCallable(functions, 'cancelNotification');
            await cancelFn({ taskName });
            console.log('Notification canceled:', taskName);
        } catch (error) {
            console.error('Error canceling push:', error);
        }
    }, []);

    return {
        fcmToken,
        permissionStatus,
        requestToken,
        sendPushNotification,
        schedulePushNotification,
        cancelPushNotification
    };
};
