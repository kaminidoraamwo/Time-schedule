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

  it('snapshots the original total planned seconds and mode as baseline', () => {
    const next = timerReducer(INITIAL_TIMER_STATE, {
      type: 'START',
      payload: { currentTime: 1000, steps: steps() },
    });
    // 20+10+30 = 60分 = 3600秒
    expect(next.originalTotalPlannedSeconds).toBe(3600);
    expect(next.mode).toBe('live');
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

describe('timerReducer INSERT_FUTURE_STEP (Wave 3)', () => {
  const started = () =>
    timerReducer(INITIAL_TIMER_STATE, { type: 'START', payload: { currentTime: 1000, steps: steps() } });

  const newStep: Step = { id: 99, name: 'カット差し込み', durationMinutes: 15 };

  it('inserts a future step without touching currentStepIndex or completedSteps', () => {
    const state = started(); // currentStepIndex=0, workingSteps=[1,2,3]
    const next = timerReducer(state, {
      type: 'INSERT_FUTURE_STEP',
      payload: { index: 1, step: newStep },
    });

    expect(next.workingSteps?.map((s) => s.id)).toEqual([1, 99, 2, 3]);
    expect(next.currentStepIndex).toBe(0);
    expect(next.completedSteps).toBe(state.completedSteps);
    // baseline は固定のまま
    expect(next.originalTotalPlannedSeconds).toBe(state.originalTotalPlannedSeconds);
  });

  it('rejects insertion at or before the current step', () => {
    const state = started();
    expect(timerReducer(state, { type: 'INSERT_FUTURE_STEP', payload: { index: 0, step: newStep } })).toBe(state);
  });

  it('rejects insertion out of range', () => {
    const state = started();
    expect(timerReducer(state, { type: 'INSERT_FUTURE_STEP', payload: { index: 99, step: newStep } })).toBe(state);
  });

  it('is a no-op when not active', () => {
    expect(
      timerReducer(INITIAL_TIMER_STATE, { type: 'INSERT_FUTURE_STEP', payload: { index: 1, step: newStep } }),
    ).toBe(INITIAL_TIMER_STATE);
  });
});

describe('timerReducer SKIP_FUTURE_STEP (Wave 3)', () => {
  const started = () =>
    timerReducer(INITIAL_TIMER_STATE, { type: 'START', payload: { currentTime: 1000, steps: steps() } });

  it('removes a future step without touching currentStepIndex or completedSteps', () => {
    const state = started(); // currentStepIndex=0, workingSteps=[1,2,3]
    const next = timerReducer(state, { type: 'SKIP_FUTURE_STEP', payload: { index: 2 } });

    expect(next.workingSteps?.map((s) => s.id)).toEqual([1, 2]);
    expect(next.currentStepIndex).toBe(0);
    expect(next.completedSteps).toBe(state.completedSteps);
  });

  it('rejects skipping the current or a past step', () => {
    const state = started();
    expect(timerReducer(state, { type: 'SKIP_FUTURE_STEP', payload: { index: 0 } })).toBe(state);
  });
});

describe('timerReducer RESTORE_WORKING_STEPS (Wave 3 undo)', () => {
  it('restores a prior working steps snapshot', () => {
    const s = timerReducer(INITIAL_TIMER_STATE, { type: 'START', payload: { currentTime: 1000, steps: steps() } });
    const prior: Step[] = [
      { id: 1, name: 'A', durationMinutes: 20 },
      { id: 2, name: 'B', durationMinutes: 10 },
    ];
    const next = timerReducer(s, { type: 'RESTORE_WORKING_STEPS', payload: { steps: prior } });
    expect(next.workingSteps).toEqual(prior);
  });

  it('rejects a restore that would drop below the current step', () => {
    const s = timerReducer(INITIAL_TIMER_STATE, { type: 'START', payload: { currentTime: 1000, steps: steps() } });
    const advanced = timerReducer(s, {
      type: 'NEXT_STEP',
      payload: { currentTime: 2000, newRecord: makeRecord(), isLastStep: false },
    }); // currentStepIndex=1
    const tooShort: Step[] = [{ id: 1, name: 'A', durationMinutes: 20 }];
    expect(timerReducer(advanced, { type: 'RESTORE_WORKING_STEPS', payload: { steps: tooShort } })).toBe(advanced);
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
