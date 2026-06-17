import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProgressCalculation } from './useProgressCalculation';
import type { Step } from '../types';

const steps: Step[] = [
  { id: 1, name: 'A', durationMinutes: 20 },
  { id: 2, name: 'B', durationMinutes: 10 },
  { id: 3, name: 'C', durationMinutes: 30 },
];

const allFinite = (nums: number[]): boolean => nums.every((n) => Number.isFinite(n));

describe('useProgressCalculation guards (Track B Wave 2)', () => {
  it('returns finite values for a normal schedule', () => {
    const { result } = renderHook(() => useProgressCalculation(steps, 600, 1, 60));
    expect(allFinite(result.current.stepWidths)).toBe(true);
    expect(Number.isFinite(result.current.scheduleProgressPercent)).toBe(true);
    expect(Number.isFinite(result.current.actualProgressPercent)).toBe(true);
    // 幅の合計はほぼ100%
    const sum = result.current.stepWidths.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 5);
  });

  it('never produces NaN/Infinity when total duration is zero', () => {
    const zeroSteps: Step[] = [
      { id: 1, name: 'A', durationMinutes: 0 },
      { id: 2, name: 'B', durationMinutes: 0 },
    ];
    const { result } = renderHook(() => useProgressCalculation(zeroSteps, 0, 0, 0));
    expect(allFinite(result.current.stepWidths)).toBe(true);
    expect(result.current.stepWidths).toEqual([0, 0]);
    expect(result.current.scheduleProgressPercent).toBe(0);
    expect(result.current.actualProgressPercent).toBe(0);
  });

  it('never produces NaN for an empty schedule', () => {
    const { result } = renderHook(() => useProgressCalculation([], 0, 0, 0));
    expect(result.current.stepWidths).toEqual([]);
    expect(result.current.scheduleProgressPercent).toBe(0);
    expect(result.current.actualProgressPercent).toBe(0);
    expect(result.current.totalDurationSeconds).toBe(0);
  });
});
