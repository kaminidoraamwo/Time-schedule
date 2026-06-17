import type { TimerState, StepRecord, Step } from '../types';

// === Action Types ===
export type TimerAction =
    | { type: 'START'; payload: { currentTime: number; steps: Step[] } }
    | { type: 'NEXT_STEP'; payload: { currentTime: number; newRecord: StepRecord; isLastStep: boolean } }
    | { type: 'PREVIOUS_STEP'; payload: { restoredStartTime: number } }
    | { type: 'SKIP_TO_FINISH'; payload: { stepsLength: number } }
    | { type: 'PAUSE'; payload: { currentTime: number } }
    | { type: 'RESUME'; payload: { currentTime: number } }
    | { type: 'DISMISS_STALE' }
    | { type: 'RESET' };

// === Initial State ===
export const INITIAL_TIMER_STATE: TimerState = {
    isActive: false,
    startTime: null,
    currentStepIndex: 0,
    stepStartTime: null,
    completedSteps: [],
    finishReason: null,
    hasStaleSession: false,
    isPaused: false,
    pausedAt: null,
    totalPausedMs: 0,
    workingSteps: [],
};

// === Reducer ===
export const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
    switch (action.type) {
        case 'START': {
            if (state.isActive) return state;
            const { currentTime, steps } = action.payload;
            return {
                ...state,
                isActive: true,
                startTime: state.startTime ?? currentTime,
                stepStartTime: state.stepStartTime ?? currentTime,
                finishReason: null,
                isPaused: false,
                pausedAt: null,
                totalPausedMs: 0,
                // START時に工程をディープコピーで固定（セッション中の真実源）
                workingSteps: steps.map(step => ({ ...step })),
            };
        }

        case 'NEXT_STEP': {
            const { currentTime, newRecord, isLastStep } = action.payload;
            return {
                ...state,
                currentStepIndex: state.currentStepIndex + 1,
                stepStartTime: currentTime,
                completedSteps: [...state.completedSteps, newRecord],
                isActive: isLastStep ? false : state.isActive,
                finishReason: isLastStep ? 'completed' : null,
                isPaused: false,
                pausedAt: null,
                totalPausedMs: 0,
            };
        }

        case 'PREVIOUS_STEP': {
            if (state.currentStepIndex <= 0) return state;
            const { restoredStartTime } = action.payload;
            return {
                ...state,
                currentStepIndex: state.currentStepIndex - 1,
                stepStartTime: restoredStartTime,
                completedSteps: state.completedSteps.slice(0, -1),
                finishReason: null,
                isPaused: false,
                pausedAt: null,
                totalPausedMs: 0,
            };
        }

        case 'SKIP_TO_FINISH': {
            const { stepsLength } = action.payload;
            return {
                ...state,
                currentStepIndex: stepsLength,
                isActive: false,
                finishReason: 'skipped',
                hasStaleSession: false,
                isPaused: false,
                pausedAt: null,
            };
        }

        case 'PAUSE': {
            if (!state.isActive || state.isPaused) return state;
            return {
                ...state,
                isPaused: true,
                pausedAt: action.payload.currentTime,
            };
        }

        case 'RESUME': {
            if (!state.isPaused || !state.pausedAt) return state;
            const pauseDuration = action.payload.currentTime - state.pausedAt;
            return {
                ...state,
                isPaused: false,
                pausedAt: null,
                totalPausedMs: state.totalPausedMs + pauseDuration,
            };
        }


        case 'DISMISS_STALE':
            return INITIAL_TIMER_STATE;

        case 'RESET':
            return INITIAL_TIMER_STATE;

        default:
            return state;
    }
};

// === Storage Helpers ===
export const loadTimerState = (storageKey: string): TimerState => {
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            const now = Date.now();
            const startTime = parsed.startTime || 0;
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;

            // 24時間超の古いセッションを検出 → リセットせずユーザーに選択させる
            if (parsed.isActive && (now - startTime > ONE_DAY_MS)) {
                return {
                    ...parsed,
                    isActive: false,
                    hasStaleSession: true,
                };
            }
            return {
                ...INITIAL_TIMER_STATE,
                ...parsed,
                hasStaleSession: false,
            };
        }
    } catch {
        // Fall through to return initial state
    }
    return INITIAL_TIMER_STATE;
};
