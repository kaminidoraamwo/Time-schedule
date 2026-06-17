import { describe, it, expect } from 'vitest';
import type { Step } from '../types';
import {
  getTotalDurationMinutes,
  getEndTime,
  validateSchedule,
  MIN_STEP_MINUTES,
} from './schedule';

const makeStep = (id: number, durationMinutes: number, name = `工程${id}`): Step => ({
  id,
  name,
  durationMinutes,
});

describe('getTotalDurationMinutes', () => {
  it('sums durationMinutes across steps', () => {
    // Arrange
    const steps = [makeStep(1, 20), makeStep(2, 10), makeStep(3, 30)];

    // Act
    const total = getTotalDurationMinutes(steps);

    // Assert
    expect(total).toBe(60);
  });

  it('returns 0 for an empty schedule', () => {
    expect(getTotalDurationMinutes([])).toBe(0);
  });
});

describe('getEndTime', () => {
  it('adds total minutes to the start time', () => {
    // Arrange
    const start = new Date('2026-06-17T15:02:00');

    // Act
    const end = getEndTime(start, 220); // 3h40m

    // Assert
    expect(end.getHours()).toBe(18);
    expect(end.getMinutes()).toBe(42);
  });

  it('does not mutate the start date', () => {
    const start = new Date('2026-06-17T15:00:00');
    const startMs = start.getTime();
    getEndTime(start, 60);
    expect(start.getTime()).toBe(startMs);
  });
});

describe('validateSchedule', () => {
  it('is valid for a normal schedule', () => {
    const steps = [makeStep(1, 20), makeStep(2, 30)];
    const result = validateSchedule(steps);
    expect(result.isValid).toBe(true);
    expect(result.invalidStepIds).toEqual([]);
    expect(result.hasNoSteps).toBe(false);
  });

  it('blocks when any step is below the minimum duration', () => {
    const steps = [makeStep(1, 20), makeStep(2, 0), makeStep(3, MIN_STEP_MINUTES - 1)];
    const result = validateSchedule(steps);
    expect(result.isValid).toBe(false);
    expect(result.invalidStepIds).toEqual([2, 3]);
  });

  it('blocks when there are no steps', () => {
    const result = validateSchedule([]);
    expect(result.isValid).toBe(false);
    expect(result.hasNoSteps).toBe(true);
  });

  it('flags a NaN/non-finite duration as invalid', () => {
    const steps = [makeStep(1, Number.NaN)];
    const result = validateSchedule(steps);
    expect(result.invalidStepIds).toEqual([1]);
    expect(result.isValid).toBe(false);
  });

  it('warns softly (without blocking) when the total is very short', () => {
    const steps = [makeStep(1, 10)];
    const result = validateSchedule(steps);
    expect(result.isValid).toBe(true);
    expect(result.warning).not.toBeNull();
  });

  it('warns softly (without blocking) when the total is very long', () => {
    const steps = [makeStep(1, 400)];
    const result = validateSchedule(steps);
    expect(result.isValid).toBe(true);
    expect(result.warning).not.toBeNull();
  });

  it('has no warning for a typical total', () => {
    const steps = [makeStep(1, 60), makeStep(2, 60)];
    const result = validateSchedule(steps);
    expect(result.warning).toBeNull();
  });
});
