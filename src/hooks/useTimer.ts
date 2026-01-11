import { useState, useEffect, useCallback } from 'react';
import type { Step } from '../constants';
import { useSound } from './useSound';

export type StepRecord = {
    stepId: number;
    plannedDuration: number; // Seconds
    actualDuration: number; // Seconds
    difference: number;
};

export type TimerState = {
    isActive: boolean;
    startTime: number | null; // Session start time
    currentStepIndex: number;
    stepStartTime: number | null; // Current step start time
    completedSteps: StepRecord[];
    notificationTaskName: string | null;
};

const STORAGE_KEY = 'salon-pacer-state';

const INITIAL_STATE: TimerState = {
    isActive: false,
    startTime: null,
    currentStepIndex: 0,
    stepStartTime: null,
    completedSteps: [],
    notificationTaskName: null,
};

export const useTimer = (
    steps: Step[],
    schedulePushNotification?: (title: string, body: string, delaySeconds: number) => Promise<string | null>,
    cancelPushNotification?: (taskName: string) => Promise<void>
) => {
    const [state, setState] = useState<TimerState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Check if data is stale (> 24 hours) or startTime is invalid
                const now = Date.now();
                const startTime = parsed.startTime || 0;
                const ONE_DAY_MS = 24 * 60 * 60 * 1000;

                if (parsed.isActive && (now - startTime > ONE_DAY_MS)) {
                    console.warn('Restoring timer state skipped due to stale data (>24h). Resetting.');
                    return INITIAL_STATE;
                }
                return parsed;
            }
            return INITIAL_STATE;
        } catch {
            return INITIAL_STATE;
        }
    });

    const [now, setNow] = useState(Date.now());
    const { initAudio, playChime, playFinish, isMuted, toggleMute } = useSound();

    // Local flags to prevent repeated audio triggers in the same step
    const [hasPlayedChime, setHasPlayedChime] = useState(false);
    const [hasPlayedFinish, setHasPlayedFinish] = useState(false);

    // Helper to calculate task delay
    const getTaskDelay = useCallback((step: Step) => {
        return step.durationMinutes * 60;
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    useEffect(() => {
        if (!state.isActive) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 200); // Check every 200ms
        return () => clearInterval(interval);
    }, [state.isActive]);

    const start = useCallback(async () => {
        initAudio();
        const currentTime = Date.now();

        // Schedule notification for the first step
        let taskName: string | null = null;
        if (steps.length > 0 && schedulePushNotification) {
            const step = steps[state.currentStepIndex];
            if (step) {
                const title = '工程終了';
                const body = `${step.name} が終了しました。次の工程へ進んでください。`;
                try {
                    taskName = await schedulePushNotification(title, body, getTaskDelay(step));
                } catch (e) {
                    console.error('Failed to schedule start task', e);
                }
            }
        }

        setState(prev => {
            if (prev.isActive) return prev;
            return {
                ...prev,
                isActive: true,
                startTime: prev.startTime ?? currentTime,
                stepStartTime: prev.stepStartTime ?? currentTime,
                notificationTaskName: taskName
            };
        });
    }, [initAudio, steps, state.currentStepIndex, schedulePushNotification, getTaskDelay]);

    const nextStep = useCallback(async () => {
        const currentTime = Date.now();

        // Cancel previous task
        if (state.notificationTaskName && cancelPushNotification) {
            await cancelPushNotification(state.notificationTaskName);
        }

        // Determine next step
        const nextIndex = state.currentStepIndex + 1;

        // Schedule next task if available
        let newTaskName: string | null = null;
        if (nextIndex < steps.length && schedulePushNotification) {
            const step = steps[nextIndex];
            const title = '工程終了';
            const body = `${step.name} が終了しました。次の工程へ進んでください。`;
            try {
                newTaskName = await schedulePushNotification(title, body, getTaskDelay(step));
            } catch (e) {
                console.error('Failed to schedule next task', e);
            }
        }

        setState(prev => {
            if (!prev.isActive || prev.currentStepIndex >= steps.length) return prev;

            const actualDuration = (currentTime - (prev.stepStartTime || currentTime)) / 1000;
            const currentStep = steps[prev.currentStepIndex];
            const plannedDuration = currentStep ? currentStep.durationMinutes * 60 : 0;

            const newRecord: StepRecord = {
                stepId: currentStep ? currentStep.id : -1,
                plannedDuration: plannedDuration,
                actualDuration: actualDuration,
                difference: actualDuration - plannedDuration,
            };

            // Reset audio flags for new step
            setHasPlayedChime(false);
            setHasPlayedFinish(false);

            return {
                ...prev,
                currentStepIndex: nextIndex,
                stepStartTime: currentTime,
                completedSteps: [...prev.completedSteps, newRecord],
                notificationTaskName: newTaskName
            };
        });
    }, [steps, state.notificationTaskName, state.currentStepIndex, cancelPushNotification, schedulePushNotification, getTaskDelay]);

    const previousStep = useCallback(async () => {
        // Cancel current task
        if (state.notificationTaskName && cancelPushNotification) {
            await cancelPushNotification(state.notificationTaskName);
        }

        setState(prev => {
            if (prev.currentStepIndex <= 0) return prev;
            return {
                ...prev,
                currentStepIndex: prev.currentStepIndex - 1,
                stepStartTime: Date.now(), // Restart step timer
                completedSteps: prev.completedSteps.slice(0, -1),
                notificationTaskName: null
            };
        });
    }, [state.notificationTaskName, cancelPushNotification]);

    const reset = useCallback(async () => {
        if (state.notificationTaskName && cancelPushNotification) {
            await cancelPushNotification(state.notificationTaskName);
        }
        setState(INITIAL_STATE);
        setHasPlayedChime(false);
        setHasPlayedFinish(false);
    }, [state.notificationTaskName, cancelPushNotification]);

    const skipToFinish = useCallback(async () => {
        if (state.notificationTaskName && cancelPushNotification) {
            await cancelPushNotification(state.notificationTaskName);
        }
        setState(prev => ({
            ...prev,
            currentStepIndex: steps.length, // Force finish
            isActive: false,
            notificationTaskName: null
        }));
    }, [state.notificationTaskName, cancelPushNotification, steps.length]);

    // --- Computed Values ---
    const isFinished = state.currentStepIndex >= steps.length;
    const currentStep = isFinished ? null : steps[state.currentStepIndex];

    // Calculate Elapsed
    const getElapsed = () => {
        if (!state.isActive) {
            return { total: 0, step: 0 };
        }
        return {
            total: (now - (state.startTime || now)) / 1000,
            step: (now - (state.stepStartTime || now)) / 1000
        };
    };

    const { total: totalElapsedSeconds, step: stepElapsedSeconds } = getElapsed();

    // --- Audio Triggers (Client Side Only) ---
    // Note: Push Notifications are now handled by Cloud Tasks (Server Side).
    // sendPushNotification is intentionally unused in this effect.
    useEffect(() => {
        if (!state.isActive || !currentStep) return;

        const durationSeconds = currentStep.durationMinutes * 60;
        const diff = durationSeconds - stepElapsedSeconds;

        // 1. Chime (3 mins before)
        const chimeThreshold = 180; // 3 mins
        if (durationSeconds > chimeThreshold && diff <= chimeThreshold && diff > 0 && !hasPlayedChime) {
            playChime();
            setHasPlayedChime(true);
        }

        // 2. Finish
        if (stepElapsedSeconds >= durationSeconds && !hasPlayedFinish) {
            playFinish();
            setHasPlayedFinish(true);
        }
    }, [state.isActive, currentStep, stepElapsedSeconds, hasPlayedChime, hasPlayedFinish, playChime, playFinish]);

    return {
        state,
        currentStep,
        totalElapsedSeconds,
        stepElapsedSeconds,
        start,
        nextStep,
        previousStep,
        reset,
        isFinished,
        isMuted,
        toggleMute,
        requestNotificationPermission: async () => { }, // Mock
        skipToFinish
    };
};
