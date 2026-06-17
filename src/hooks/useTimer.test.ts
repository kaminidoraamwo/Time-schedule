import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTimer } from './useTimer';
import type { Step } from '../types';

// jsdom には AudioContext が無いため最小モックを用意（initAudio がクラッシュしないように）
class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  resume = vi.fn();
  createOscillator() {
    return { type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
  }
  createGain() {
    return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() };
  }
  destination = {};
}

const baseSteps: Step[] = [
  { id: 1, name: 'カウンセリング', durationMinutes: 20 },
  { id: 2, name: 'シャンプー', durationMinutes: 10 },
  { id: 3, name: '薬剤放置', durationMinutes: 30 },
];

describe('useTimer workingSteps fixation (Track B Wave 1)', () => {
  beforeEach(() => {
    localStorage.clear();
    (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  });

  it('uses live steps before starting', () => {
    const { result } = renderHook(({ steps }) => useTimer(steps), {
      initialProps: { steps: baseSteps },
    });
    expect(result.current.activeSteps).toEqual(baseSteps);
    expect(result.current.currentStep?.name).toBe('カウンセリング');
  });

  it('keeps the running timer stable when live steps are edited mid-session', () => {
    const { result, rerender } = renderHook(({ steps }) => useTimer(steps), {
      initialProps: { steps: baseSteps },
    });

    act(() => {
      result.current.start();
    });

    // 施術中に設定で工程を丸ごと差し替える（短く・改名）
    const editedSteps: Step[] = [{ id: 9, name: '別メニュー', durationMinutes: 5 }];
    rerender({ steps: editedSteps });

    // 進行中タイマーは START 時のスナップショットを維持
    expect(result.current.activeSteps).toHaveLength(3);
    expect(result.current.currentStep?.name).toBe('カウンセリング');
    expect(result.current.isFinished).toBe(false);
  });

  it('burns the step name into the record on nextStep', () => {
    const { result } = renderHook(({ steps }) => useTimer(steps), {
      initialProps: { steps: baseSteps },
    });

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.nextStep();
    });

    expect(result.current.state.completedSteps).toHaveLength(1);
    expect(result.current.state.completedSteps[0].stepName).toBe('カウンセリング');
    expect(result.current.state.currentStepIndex).toBe(1);
  });

  it('inserts a future step after the current one without moving the current step', () => {
    const { result } = renderHook(({ steps }) => useTimer(steps), {
      initialProps: { steps: baseSteps },
    });
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.insertFutureStep({ name: 'カット差し込み', durationMinutes: 15 });
    });

    expect(result.current.activeSteps).toHaveLength(4);
    // 現在工程は不変、挿入は直後
    expect(result.current.currentStep?.name).toBe('カウンセリング');
    expect(result.current.activeSteps[1].name).toBe('カット差し込み');
    expect(result.current.state.currentStepIndex).toBe(0);
  });

  it('skips a future step and can undo via restoreWorkingSteps', () => {
    const { result } = renderHook(({ steps }) => useTimer(steps), {
      initialProps: { steps: baseSteps },
    });
    act(() => {
      result.current.start();
    });

    const before = result.current.activeSteps;
    act(() => {
      result.current.skipFutureStep(2); // 「薬剤放置」をスキップ
    });
    expect(result.current.activeSteps.map((s) => s.name)).toEqual(['カウンセリング', 'シャンプー']);

    act(() => {
      result.current.restoreWorkingSteps(before);
    });
    expect(result.current.activeSteps).toHaveLength(3);
  });

  it('falls back to live steps after reset', () => {
    const { result, rerender } = renderHook(({ steps }) => useTimer(steps), {
      initialProps: { steps: baseSteps },
    });

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.reset();
    });

    const newSteps: Step[] = [{ id: 5, name: '新メニュー', durationMinutes: 15 }];
    rerender({ steps: newSteps });

    expect(result.current.activeSteps).toEqual(newSteps);
  });
});
