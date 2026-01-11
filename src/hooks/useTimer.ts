import { useState, useEffect, useCallback } from 'react';
import type { Step } from '../constants';
import { useSound } from './useSound';

export type StepRecord = {
    stepId: number;
    plannedDuration: number;
    actualDuration: number; // in seconds
    startTime: number;
    endTime: number;
};

export type TimerState = {
    isActive: boolean;
    startTime: number | null; // Global start time
    currentStepIndex: number;
    stepStartTime: number | null; // Current step start time
    completedSteps: StepRecord[];
};

const STORAGE_KEY = 'salon-pacer-state';

const INITIAL_STATE: TimerState = {
    isActive: false,
    startTime: null,
    currentStepIndex: 0,
    stepStartTime: null,
    completedSteps: [],
};

export const useTimer = (steps: Step[], sendPushNotification?: (title: string, body: string) => Promise<void>) => {

    const [state, setState] = useState<TimerState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : INITIAL_STATE;
        } catch (error) {
            console.error('Failed to parse timer state:', error);
            return INITIAL_STATE;
        }
    });

    const { playChime, playFinish, initAudio, isMuted, toggleMute } = useSound();
    const [hasPlayedChime, setHasPlayedChime] = useState(false);
    const [hasPlayedFinish, setHasPlayedFinish] = useState(false);
    const [hasNotified, setHasNotified] = useState(false);

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Update 'now' every second when active, and also on initial load
    useEffect(() => {
        // Immediately sync 'now' on mount to ensure real-time calculation
        setNow(Date.now());

        let interval: number;
        if (state.isActive) {
            interval = setInterval(() => {
                setNow(Date.now());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.isActive]);

    const start = useCallback(() => {
        initAudio();
        const currentTime = Date.now();
        setState(prev => {
            if (prev.isActive) return prev;
            return {
                ...prev,
                isActive: true,
                startTime: prev.startTime ?? currentTime,
                stepStartTime: prev.stepStartTime ?? currentTime,
            };
        });
    }, [initAudio]);

    const nextStep = useCallback(() => {
        const currentTime = Date.now();
        setState(prev => {
            if (!prev.isActive || prev.currentStepIndex >= steps.length) return prev;

            const currentStep = steps[prev.currentStepIndex];
            const stepDurationSeconds = Math.floor((currentTime - (prev.stepStartTime || currentTime)) / 1000);

            const newRecord: StepRecord = {
                stepId: currentStep.id,
                plannedDuration: currentStep.durationMinutes * 60,
                actualDuration: stepDurationSeconds,
                startTime: prev.stepStartTime || currentTime,
                endTime: currentTime,
            };

            const nextIndex = prev.currentStepIndex + 1;
            const isFinished = nextIndex >= steps.length;

            // Reset sound and notification flags for next step
            setHasPlayedChime(false);
            setHasPlayedFinish(false);
            setHasNotified(false);

            return {
                ...prev,
                isActive: !isFinished,
                currentStepIndex: nextIndex,
                stepStartTime: isFinished ? null : currentTime,
                completedSteps: [...prev.completedSteps, newRecord],
            };
        });
    }, [steps]);

    const previousStep = useCallback(() => {
        setState(prev => {
            if (prev.currentStepIndex <= 0) return prev;

            const newCompletedSteps = [...prev.completedSteps];
            const lastCompletedStep = newCompletedSteps.pop();

            return {
                ...prev,
                isActive: true,
                currentStepIndex: prev.currentStepIndex - 1,
                stepStartTime: lastCompletedStep ? lastCompletedStep.startTime : prev.stepStartTime,
                completedSteps: newCompletedSteps,
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const skipToFinish = useCallback(() => {
        const currentTime = Date.now();
        setState(prev => {
            if (!prev.isActive || prev.currentStepIndex >= steps.length) return prev;

            // 1. Finish current step
            const currentStep = steps[prev.currentStepIndex];
            const currentStepDuration = Math.floor((currentTime - (prev.stepStartTime || currentTime)) / 1000);

            const currentRecord: StepRecord = {
                stepId: currentStep.id,
                plannedDuration: currentStep.durationMinutes * 60,
                actualDuration: currentStepDuration,
                startTime: prev.stepStartTime || currentTime,
                endTime: currentTime,
            };

            // 2. Skip remaining steps
            const skippedRecords: StepRecord[] = [];
            for (let i = prev.currentStepIndex + 1; i < steps.length; i++) {
                const s = steps[i];
                skippedRecords.push({
                    stepId: s.id,
                    plannedDuration: s.durationMinutes * 60,
                    actualDuration: 0,
                    startTime: currentTime,
                    endTime: currentTime,
                });
            }

            // Reset flags
            setHasPlayedChime(false);
            setHasPlayedFinish(false);
            setHasNotified(false);

            return {
                ...prev,
                isActive: false, // Stop timer
                currentStepIndex: steps.length, // Move to end
                stepStartTime: null,
                completedSteps: [...prev.completedSteps, currentRecord, ...skippedRecords],
            };
        });
    }, [steps]);

    const currentStep = steps[state.currentStepIndex];

    // Calculate elapsed times
    const totalElapsedSeconds = state.startTime ? Math.floor((now - state.startTime) / 1000) : 0;
    const stepElapsedSeconds = state.stepStartTime ? Math.floor((now - state.stepStartTime) / 1000) : 0;

    // Sound Logic
    useEffect(() => {
        if (!state.isActive || !currentStep) return;

        const durationSeconds = currentStep.durationMinutes * 60;

        // 80% Warning Chime
        if (!hasPlayedChime && stepElapsedSeconds >= durationSeconds * 0.8 && stepElapsedSeconds < durationSeconds) {
            playChime();
            setHasPlayedChime(true);
        }

        // 100% Finish Sound
        if (!hasPlayedFinish && stepElapsedSeconds >= durationSeconds) {
            playFinish();
            setHasPlayedFinish(true);
        }
    }, [state.isActive, currentStep, stepElapsedSeconds, hasPlayedChime, hasPlayedFinish, playChime, playFinish]);
    // Notification Logic
    useEffect(() => {
        if (!hasNotified && stepElapsedSeconds >= (currentStep?.durationMinutes || 0) * 60) {
            const title = '工程終了';
            const body = `${currentStep?.name} が終了しました。次の工程へ進んでください。`;

            // Local Notification
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: './pwa-192x192.png'
                });
            }

            // Remote Push Notification (Automatic)
            if (sendPushNotification) {
                sendPushNotification(title, body)
                    .catch(err => console.error('Auto push failed:', err));
            }

            setHasNotified(true);
        }
    }, [hasNotified, stepElapsedSeconds, currentStep, sendPushNotification]);

    const requestNotificationPermission = useCallback(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Request permission on start
    const startWithPermission = useCallback(() => {
        requestNotificationPermission();
        start();
    }, [start, requestNotificationPermission]);

    return {
        state,
        currentStep,
        totalElapsedSeconds,
        stepElapsedSeconds,

        start: startWithPermission,
        nextStep,
        previousStep,
        reset,
        skipToFinish, // Exposed
        isFinished: state.currentStepIndex >= steps.length,
        isMuted,
        toggleMute,
        requestNotificationPermission,
    };
};
