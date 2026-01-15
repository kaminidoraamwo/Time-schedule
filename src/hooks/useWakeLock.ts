import { useState, useEffect, useCallback, useRef } from 'react';

export const useWakeLock = (isActive: boolean) => {
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const lock = await (navigator as any).wakeLock.request('screen');
                setWakeLock(lock);

                lock.addEventListener('release', () => {
                    setWakeLock(null);
                });
            } catch {
                // Wake Lock取得失敗（バッテリー残量低下時など）
            }
        }
        // Wake Lock API非対応ブラウザでは何もしない
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLock) {
            try {
                await wakeLock.release();
            } catch {
                // 解放失敗時は無視
            }
            setWakeLock(null);
        }
    }, [wakeLock]);

    // Store wakeLock in ref for cleanup
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        wakeLockRef.current = wakeLock;
    }, [wakeLock]);

    useEffect(() => {
        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => {
            // Cleanup on unmount - use ref to avoid stale closure
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => { });
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

