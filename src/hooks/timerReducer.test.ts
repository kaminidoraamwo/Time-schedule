import { describe, it, expect } from 'vitest';
import type { Step, StepRecord, TimerState } from '../types';
import { timerReducer, INITIAL_TIMER_STATE, loadTimerState } from './timerReducer';
import { STORAGE_KEYS } from '../constants';

const steps = (): Step[] => [
  { id: 1, name: 'カウンセリング', durationMinutes: 20 },
  { id: 2, name: 'シャンプー', durationMinutes: 10 },
  { id: 3, name: '薬剤放置', durationMinutes: 30 },
];

const makeRecord = (overrides: Partial<StepRecord> = {}): StepRecord => ({
  stepId: 1,
  plannedDuration: 1200,
  actualDuration: 1100,
  difference: -100,
  stepName: 'カウンセリング',
  ...overrides,
});

describe('timerReducer START', () => {
  it('snapshots the steps into workingSteps as a deep copy', () => {
    const source = steps();
    const next = timerReducer(INITIAL_TIMER_STATE, {
      type: 'START',
      payload: { currentTime: 1000, steps: source },
    });

    expect(next.isActive).toBe(true);
    expect(next.workingSteps).toEqual(source);

    // 元配列を後から変更しても workingSteps は不変（ディープコピー）
    source[0].durationMinutes = 999;
    source.push({ id: 99, name: '乱入', durationMinutes: 5 });
    expect(next.workingSteps?.[0].durationMinutes).toBe(20);
    expect(next.workingSteps).toHaveLength(3);
  });

  it('is a no-op when already active', () => {
    const active: TimerState = { ...INITIAL_TIMER_STATE, isActive: true, startTime: 500 };
    const next = timerReducer(active, {
      type: 'START',
      payload: { currentTime: 1000, steps: steps() },
    });
    expect(next).toBe(active);
  });
});

describe('timerReducer NEXT_STEP', () => {
  it('appends the record and keeps completedSteps.length === currentStepIndex', () => {
    const started = timerReducer(INITIAL_TIMER_STATE, {
      type: 'START',
      payload: { currentTime: 1000, steps: steps() },
    });

    const next = timerReducer(started, {
      type: 'NEXT_STEP',
      payload: { currentTime: 2000, newRecord: makeRecord(), isLastStep: false },
    });

    expect(next.currentStepIndex).toBe(1);
    expect(next.completedSteps).toHaveLength(1);
    expect(next.completedSteps.length).toBe(next.currentStepIndex);
    expect(next.completedSteps[0].stepName).toBe('カウンセリング');
    expect(next.isActive).toBe(true);
  });

  it('finishes on the last step', () => {
    const started = timerReducer(INITIAL_TIMER_STATE, {
      type: 'START',
      payload: { currentTime: 1000, steps: steps() },
    });
    const next = timerReducer(started, {
      type: 'NEXT_STEP',
      payload: { currentTime: 2000, newRecord: makeRecord(), isLastStep: true },
    });
    expect(next.isActive).toBe(false);
    expect(next.finishReason).toBe('completed');
  });
});

describe('timerReducer RESET', () => {
  it('clears workingSteps', () => {
    const started = timerReducer(INITIAL_TIMER_STATE, {
      type: 'START',
      payload: { currentTime: 1000, steps: steps() },
    });
    const reset = timerReducer(started, { type: 'RESET' });
    expect(reset.workingSteps).toEqual([]);
    expect(reset.isActive).toBe(false);
  });
});

describe('loadTimerState backward compatibility', () => {
  it('defaults workingSteps to [] for legacy saved data without the field', () => {
    const legacy = {
      isActive: true,
      startTime: Date.now(),
      currentStepIndex: 1,
      stepStartTime: Date.now(),
      completedSteps: [{ stepId: 1, plannedDuration: 1200, actualDuration: 1100, difference: -100 }],
      finishReason: null,
      isPaused: false,
      pausedAt: null,
      totalPausedMs: 0,
    };
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(legacy));

    const loaded = loadTimerState(STORAGE_KEYS.TIMER_STATE);

    expect(loaded.workingSteps).toEqual([]);
    expect(loaded.currentStepIndex).toBe(1);
    localStorage.clear();
  });
});
