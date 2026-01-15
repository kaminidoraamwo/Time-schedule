import type { TimerState, StepRecord } from '../types';

// === Action Types ===
export type TimerAction =
    | { type: 'START'; payload: { currentTime: number } }
    | { type: 'NEXT_STEP'; payload: { currentTime: number; newRecord: StepRecord } }
    | { type: 'PREVIOUS_STEP'; payload: { restoredStartTime: number } }
    | { type: 'SKIP_TO_FINISH'; payload: { stepsLength: number } }
    | { type: 'RESET' };

// === Initial State ===
export const INITIAL_TIMER_STATE: TimerState = {
    isActive: false,
    startTime: null,
    currentStepIndex: 0,
    stepStartTime: null,
    completedSteps: [],
};

// === Reducer ===
export const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
    switch (action.type) {
        case 'START': {
            if (state.isActive) return state;
            const { currentTime } = action.payload;
            return {
                ...state,
                isActive: true,
                startTime: state.startTime ?? currentTime,
                stepStartTime: state.stepStartTime ?? currentTime,
            };
        }

        case 'NEXT_STEP': {
            const { currentTime, newRecord } = action.payload;
            return {
                ...state,
                currentStepIndex: state.currentStepIndex + 1,
                stepStartTime: currentTime,
                completedSteps: [...state.completedSteps, newRecord],
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
            };
        }

        case 'SKIP_TO_FINISH': {
            const { stepsLength } = action.payload;
            return {
                ...state,
                currentStepIndex: stepsLength,
                isActive: false,
            };
        }

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

            // Check if data is stale (> 24 hours)
            if (parsed.isActive && (now - startTime > ONE_DAY_MS)) {
                console.warn('Restoring timer state skipped due to stale data (>24h). Resetting.');
                return INITIAL_TIMER_STATE;
            }
            return parsed;
        }
    } catch {
        // Fall through to return initial state
    }
    return INITIAL_TIMER_STATE;
};
