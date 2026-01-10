import { useState, useEffect, useCallback } from 'react';
import { SCHEDULE_STEPS } from '../constants';

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

export const useTimer = () => {
    const [state, setState] = useState<TimerState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    useEffect(() => {
        let interval: number;
        if (state.isActive) {
            interval = setInterval(() => {
                setNow(Date.now());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.isActive]);

    const start = useCallback(() => {
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
    }, []);

    const nextStep = useCallback(() => {
        const currentTime = Date.now();
        setState(prev => {
            if (!prev.isActive || prev.currentStepIndex >= SCHEDULE_STEPS.length) return prev;

            const currentStep = SCHEDULE_STEPS[prev.currentStepIndex];
            const stepDurationSeconds = Math.floor((currentTime - (prev.stepStartTime || currentTime)) / 1000);

            const newRecord: StepRecord = {
                stepId: currentStep.id,
                plannedDuration: currentStep.durationMinutes * 60,
                actualDuration: stepDurationSeconds,
                startTime: prev.stepStartTime || currentTime,
                endTime: currentTime,
            };

            const nextIndex = prev.currentStepIndex + 1;
            const isFinished = nextIndex >= SCHEDULE_STEPS.length;

            return {
                ...prev,
                isActive: !isFinished,
                currentStepIndex: nextIndex,
                stepStartTime: isFinished ? null : currentTime,
                completedSteps: [...prev.completedSteps, newRecord],
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const currentStep = SCHEDULE_STEPS[state.currentStepIndex];

    // Calculate elapsed times
    const totalElapsedSeconds = state.startTime ? Math.floor((now - state.startTime) / 1000) : 0;
    const stepElapsedSeconds = state.stepStartTime ? Math.floor((now - state.stepStartTime) / 1000) : 0;

    return {
        state,
        currentStep,
        totalElapsedSeconds,
        stepElapsedSeconds,
        start,
        nextStep,
        reset,
        isFinished: state.currentStepIndex >= SCHEDULE_STEPS.length,
    };
};
