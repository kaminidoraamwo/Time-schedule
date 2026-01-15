import { useEffect, useCallback, useRef } from 'react';

export const useWakeLock = (isActive: boolean) => {
    // Use ref to track lock status without triggering re-renders
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                // Prevent multiple locks
                if (wakeLockRef.current) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const lock = await (navigator as any).wakeLock.request('screen');
                wakeLockRef.current = lock;

                lock.addEventListener('release', () => {
                    wakeLockRef.current = null;
                });
            } catch {
                // Wake Lock取得失敗（バッテリー残量低下時など）
            }
        }
        // Wake Lock API非対応ブラウザでは何もしない
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
            } catch {
                // 解放失敗時は無視
            }
            wakeLockRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => {
            // Cleanup on unmount
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => { });
                wakeLockRef.current = null;
            }
        };
    }, [isActive, requestWakeLock, releaseWakeLock]);

    // Handle visibility change (re-acquire lock if tab becomes visible again and should be active)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isActive) {
                // If we became visible and supposed to be active, re-request
                // Note: The previous lock is automatically released by the browser when visibility changes to hidden usually.
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, requestWakeLock]);
};

