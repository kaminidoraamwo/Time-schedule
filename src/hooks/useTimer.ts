import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, type Step } from '../constants';
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
};

const STORAGE_KEY = STORAGE_KEYS.TIMER_STATE;

const INITIAL_STATE: TimerState = {
    isActive: false,
    startTime: null,
    currentStepIndex: 0,
    stepStartTime: null,
    completedSteps: [],
};

export const useTimer = (steps: Step[]) => {
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

    const [now, setNow] = useState(() => Date.now());
    const { initAudio, playChime, playFinish, isMuted, toggleMute } = useSound();

    // Local flags to prevent repeated audio triggers in the same step
    const hasPlayedChime = useRef(false);
    const hasPlayedFinish = useRef(false);

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

        // Determine next step
        const nextIndex = state.currentStepIndex + 1;

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
            hasPlayedChime.current = false;
            hasPlayedFinish.current = false;

            return {
                ...prev,
                currentStepIndex: nextIndex,
                stepStartTime: currentTime,
                completedSteps: [...prev.completedSteps, newRecord],
            };
        });
    }, [steps, state.currentStepIndex]);

    const previousStep = useCallback(() => {
        setState(prev => {
            if (prev.currentStepIndex <= 0) return prev;
            const lastStep = prev.completedSteps[prev.completedSteps.length - 1];
            // Restore start time: (Current Step Start Time) - (Previous Step Duration)
            // This effectively merges the time spent in the current step into the previous step
            const restoredStartTime = lastStep && prev.stepStartTime
                ? prev.stepStartTime - (lastStep.actualDuration * 1000)
                : Date.now();

            return {
                ...prev,
                currentStepIndex: prev.currentStepIndex - 1,
                stepStartTime: restoredStartTime,
                completedSteps: prev.completedSteps.slice(0, -1),
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
        hasPlayedChime.current = false;
        hasPlayedFinish.current = false;
    }, []);

    const skipToFinish = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStepIndex: steps.length, // Force finish
            isActive: false,
        }));
    }, [steps.length]);

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
    useEffect(() => {
        if (!state.isActive || !currentStep) return;

        const durationSeconds = currentStep.durationMinutes * 60;
        const diff = durationSeconds - stepElapsedSeconds;

        // 1. Chime (3 mins before)
        const chimeThreshold = 180; // 3 mins
        if (durationSeconds > chimeThreshold && diff <= chimeThreshold && diff > 0 && !hasPlayedChime.current) {
            playChime();
            hasPlayedChime.current = true;
        }

        // 2. Finish
        if (stepElapsedSeconds >= durationSeconds && !hasPlayedFinish.current) {
            playFinish();
            hasPlayedFinish.current = true;
        }
    }, [state.isActive, currentStep, stepElapsedSeconds, playChime, playFinish]);

    return {
        state,
        now, // Export now for synchronization
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
        skipToFinish
    };
};
