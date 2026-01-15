import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import type { Step, StepRecord } from '../types';
import { useSound } from './useSound';
import { timerReducer, loadTimerState } from './timerReducer';

const STORAGE_KEY = STORAGE_KEYS.TIMER_STATE;

// === Audio Trigger Constants ===
const CHIME_THRESHOLD_SECONDS = 180; // 3 minutes before

export const useTimer = (steps: Step[]) => {
    const [state, dispatch] = useReducer(
        timerReducer,
        STORAGE_KEY,
        loadTimerState
    );

    const [now, setNow] = useState(() => Date.now());
    const { initAudio, playChime, playFinish, isMuted, toggleMute } = useSound();

    // Audio trigger flags
    const hasPlayedChime = useRef(false);
    const hasPlayedFinish = useRef(false);

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Update current time periodically when active
    useEffect(() => {
        if (!state.isActive) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 200);
        return () => clearInterval(interval);
    }, [state.isActive]);

    // === Actions ===
    const start = useCallback(() => {
        initAudio();
        dispatch({ type: 'START', payload: { currentTime: Date.now() } });
    }, [initAudio]);

    const nextStep = useCallback(() => {
        if (!state.isActive || state.currentStepIndex >= steps.length) return;

        const currentTime = Date.now();
        const actualDuration = (currentTime - (state.stepStartTime || currentTime)) / 1000;
        const currentStep = steps[state.currentStepIndex];
        const plannedDuration = currentStep ? currentStep.durationMinutes * 60 : 0;

        const newRecord: StepRecord = {
            stepId: currentStep ? currentStep.id : -1,
            plannedDuration,
            actualDuration,
            difference: actualDuration - plannedDuration,
        };

        // Reset audio flags for new step
        hasPlayedChime.current = false;
        hasPlayedFinish.current = false;

        // 最後のステップかどうかを判定
        const isLastStep = state.currentStepIndex === steps.length - 1;

        dispatch({ type: 'NEXT_STEP', payload: { currentTime, newRecord, isLastStep } });
    }, [steps, state.isActive, state.currentStepIndex, state.stepStartTime]);

    const previousStep = useCallback(() => {
        if (state.currentStepIndex <= 0) return;

        const lastStep = state.completedSteps[state.completedSteps.length - 1];
        const restoredStartTime = lastStep && state.stepStartTime
            ? state.stepStartTime - (lastStep.actualDuration * 1000)
            : Date.now();

        dispatch({ type: 'PREVIOUS_STEP', payload: { restoredStartTime } });
    }, [state.currentStepIndex, state.completedSteps, state.stepStartTime]);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
        hasPlayedChime.current = false;
        hasPlayedFinish.current = false;
    }, []);

    const skipToFinish = useCallback(() => {
        dispatch({ type: 'SKIP_TO_FINISH', payload: { stepsLength: steps.length } });
    }, [steps.length]);

    // === Computed Values ===
    const isFinished = state.currentStepIndex >= steps.length;
    const currentStep = isFinished ? null : steps[state.currentStepIndex];

    const totalElapsedSeconds = state.isActive
        ? (now - (state.startTime || now)) / 1000
        : 0;

    const stepElapsedSeconds = state.isActive
        ? (now - (state.stepStartTime || now)) / 1000
        : 0;

    // === Audio Triggers ===
    useEffect(() => {
        if (!state.isActive || !currentStep) return;

        const durationSeconds = currentStep.durationMinutes * 60;
        const diff = durationSeconds - stepElapsedSeconds;

        // Chime (3 mins before)
        if (durationSeconds > CHIME_THRESHOLD_SECONDS && diff <= CHIME_THRESHOLD_SECONDS && diff > 0 && !hasPlayedChime.current) {
            playChime();
            hasPlayedChime.current = true;
        }

        // Finish sound
        if (stepElapsedSeconds >= durationSeconds && !hasPlayedFinish.current) {
            playFinish();
            hasPlayedFinish.current = true;
        }
    }, [state.isActive, currentStep, stepElapsedSeconds, playChime, playFinish]);

    return {
        state,
        now,
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
        skipToFinish,
    };
};
