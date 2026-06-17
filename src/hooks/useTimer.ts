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

    // セッション中の真実源: START時に固定した workingSteps を優先。
    // 旧データや未開始時は live steps にフォールバック（後方互換）。
    const hasWorkingSteps = !!(state.workingSteps && state.workingSteps.length > 0);
    const activeSteps = hasWorkingSteps ? state.workingSteps! : steps;

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Update current time periodically when active and not paused
    useEffect(() => {
        if (!state.isActive || state.isPaused) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 200);
        return () => clearInterval(interval);
    }, [state.isActive, state.isPaused]);

    // === Actions ===
    const start = useCallback(() => {
        initAudio();
        // live steps をディープコピーしてスナップショット（編集が進行中セッションを壊さない）
        dispatch({ type: 'START', payload: { currentTime: Date.now(), steps: steps.map(s => ({ ...s })) } });
    }, [initAudio, steps]);

    const nextStep = useCallback(() => {
        if (!state.isActive || state.currentStepIndex >= activeSteps.length) return;

        const currentTime = Date.now();
        const rawDuration = (currentTime - (state.stepStartTime || currentTime)) / 1000;
        const pausedSeconds = state.totalPausedMs / 1000;
        const actualDuration = rawDuration - pausedSeconds;
        const currentStep = activeSteps[state.currentStepIndex];
        const plannedDuration = currentStep ? currentStep.durationMinutes * 60 : 0;

        const newRecord: StepRecord = {
            stepId: currentStep ? currentStep.id : -1,
            plannedDuration,
            actualDuration,
            difference: actualDuration - plannedDuration,
            stepName: currentStep ? currentStep.name : undefined, // 記録時に工程名を焼き込む（R5）
        };

        // Reset audio flags for new step
        hasPlayedChime.current = false;
        hasPlayedFinish.current = false;

        // 最後のステップかどうかを判定
        const isLastStep = state.currentStepIndex === activeSteps.length - 1;

        dispatch({ type: 'NEXT_STEP', payload: { currentTime, newRecord, isLastStep } });
    }, [activeSteps, state.isActive, state.currentStepIndex, state.stepStartTime, state.totalPausedMs]);

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
        dispatch({ type: 'SKIP_TO_FINISH', payload: { stepsLength: activeSteps.length } });
    }, [activeSteps.length]);

    const dismissStaleSession = useCallback(() => {
        dispatch({ type: 'DISMISS_STALE' });
    }, []);

    // === 施術中の工程編集（第3波 MVP: 未来工程の挿入/スキップ） ===
    const insertFutureStep = useCallback((draft: { name: string; durationMinutes: number }, index?: number) => {
        const ws = state.workingSteps ?? [];
        const newId = Math.max(0, ...ws.map(s => s.id)) + 1;
        const step: Step = { id: newId, name: draft.name, durationMinutes: draft.durationMinutes };
        // 既定は現在工程の直後（これからの工程）に挿入
        const targetIndex = index ?? state.currentStepIndex + 1;
        dispatch({ type: 'INSERT_FUTURE_STEP', payload: { index: targetIndex, step } });
    }, [state.workingSteps, state.currentStepIndex]);

    const skipFutureStep = useCallback((index: number) => {
        dispatch({ type: 'SKIP_FUTURE_STEP', payload: { index } });
    }, []);

    const restoreWorkingSteps = useCallback((restored: Step[]) => {
        dispatch({ type: 'RESTORE_WORKING_STEPS', payload: { steps: restored } });
    }, []);

    const togglePause = useCallback(() => {
        const currentTime = Date.now();
        if (state.isPaused) {
            dispatch({ type: 'RESUME', payload: { currentTime } });
        } else {
            dispatch({ type: 'PAUSE', payload: { currentTime } });
        }
    }, [state.isPaused]);

    // === Computed Values ===
    const isFinished = state.currentStepIndex >= activeSteps.length;
    const currentStep = isFinished ? null : activeSteps[state.currentStepIndex];

    // 一時停止中は pausedAt 時点で止める、経過時間から一時停止分を差し引く
    const effectiveNow = state.isPaused ? (state.pausedAt || now) : now;

    const totalElapsedSeconds = state.isActive
        ? Math.max(0, ((effectiveNow - (state.startTime || effectiveNow)) - state.totalPausedMs) / 1000)
        : 0;

    const stepElapsedSeconds = state.isActive
        ? Math.max(0, ((effectiveNow - (state.stepStartTime || effectiveNow)) - state.totalPausedMs) / 1000)
        : 0;

    // === Audio Triggers ===
    useEffect(() => {
        if (!state.isActive || !currentStep || state.isPaused) return;

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
    }, [state.isActive, state.isPaused, currentStep, stepElapsedSeconds, playChime, playFinish]);

    return {
        state,
        now,
        activeSteps,
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
        togglePause,
        dismissStaleSession,
        insertFutureStep,
        skipFutureStep,
        restoreWorkingSteps,
    };
};
