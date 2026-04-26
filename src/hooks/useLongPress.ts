import { useRef, useCallback, useState } from 'react';

const LONG_PRESS_DURATION = 800; // ms

/**
 * 長押し検出フック
 * - 指定時間（0.8秒）押し続けるとonActionが発火
 * - 押している間のプログレス（0〜1）を返す
 * - タッチ途中で離すとキャンセル
 */
export const useLongPress = (onAction: () => void) => {
    const [progress, setProgress] = useState(0);
    const [isPressed, setIsPressed] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
    const startTimeRef = useRef<number>(0);

    const startProgress = useCallback(() => {
        startTimeRef.current = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min(elapsed / LONG_PRESS_DURATION, 1);
            setProgress(p);
            if (p < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };
        animRef.current = requestAnimationFrame(animate);
    }, []);

    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (animRef.current) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
        }
        setProgress(0);
        setIsPressed(false);
    }, []);

    const handleStart = useCallback(() => {
        if (timerRef.current) return; // 既に押下中なら無視（タッチ→マウスの二重発火防止）
        setIsPressed(true);
        startProgress();
        timerRef.current = setTimeout(() => {
            onAction();
            cleanup();
        }, LONG_PRESS_DURATION);
    }, [onAction, startProgress, cleanup]);

    const handleEnd = useCallback(() => {
        cleanup();
    }, [cleanup]);

    const handlers = {
        onMouseDown: handleStart,
        onMouseUp: handleEnd,
        onMouseLeave: handleEnd,
        onTouchStart: handleStart,
        onTouchEnd: handleEnd,
        onTouchCancel: handleEnd,
    };

    return { handlers, progress, isPressed };
};
