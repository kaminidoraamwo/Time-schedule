import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSettings } from './useSettings';
import { TEMPLATES } from '../constants';

describe('useSettings.applyTemplate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('replaces steps with a copy of the chosen template', () => {
    const { result } = renderHook(() => useSettings());
    const cut = TEMPLATES.find((t) => t.name === 'カット')!;

    act(() => {
      result.current.applyTemplate(cut.id);
    });

    expect(result.current.steps).toHaveLength(cut.steps.length);
    expect(result.current.steps.map((s) => s.name)).toEqual(
      cut.steps.map((s) => s.name),
    );
  });

  it('deep-copies template steps so the source template is never mutated', () => {
    const { result } = renderHook(() => useSettings());
    const cut = TEMPLATES.find((t) => t.name === 'カット')!;
    const originalFirstDuration = cut.steps[0].durationMinutes;

    act(() => {
      result.current.applyTemplate(cut.id);
    });
    act(() => {
      result.current.updateStep(result.current.steps[0].id, 'durationMinutes', 999);
    });

    // 元テンプレートの定数は書き換わっていない
    expect(cut.steps[0].durationMinutes).toBe(originalFirstDuration);
  });

  it('ignores an unknown template id', () => {
    const { result } = renderHook(() => useSettings());
    const before = result.current.steps;

    act(() => {
      result.current.applyTemplate('does-not-exist');
    });

    expect(result.current.steps).toEqual(before);
  });
});

describe('useSettings.duplicateStep', () => {
  beforeEach(() => localStorage.clear());

  it('inserts a copy directly after the source step with a fresh id', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.applyTemplate('tpl-cut'));
    const beforeLen = result.current.steps.length;
    const target = result.current.steps[1];

    act(() => result.current.duplicateStep(target.id));

    const ids = result.current.steps.map((s) => s.id);
    expect(result.current.steps).toHaveLength(beforeLen + 1);
    // コピーは直後に入る
    expect(result.current.steps[2].name).toBe(target.name);
    expect(result.current.steps[2].durationMinutes).toBe(target.durationMinutes);
    // id は衝突しない
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('useSettings.reorderSteps', () => {
  beforeEach(() => localStorage.clear());

  it('moves a step from one index to another immutably', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.applyTemplate('tpl-cut'));
    const names = result.current.steps.map((s) => s.name);

    act(() => result.current.reorderSteps(0, 2)); // 先頭を index2 へ

    const expected = [...names];
    const [first] = expected.splice(0, 1);
    expected.splice(2, 0, first);
    const moved = result.current.steps.map((s) => s.name);
    expect(moved).toEqual(expected);
  });

  it('is a no-op for out-of-range indices', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.applyTemplate('tpl-cut'));
    const before = result.current.steps;
    act(() => result.current.reorderSteps(0, 99));
    expect(result.current.steps).toEqual(before);
  });
});

describe('useSettings.addNamedStep', () => {
  beforeEach(() => localStorage.clear());

  it('appends a step with the given name and the previous step duration as default', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.applyTemplate('tpl-cut'));
    const lastDuration = result.current.steps[result.current.steps.length - 1].durationMinutes;

    act(() => result.current.addNamedStep('カット'));

    const added = result.current.steps[result.current.steps.length - 1];
    expect(added.name).toBe('カット');
    expect(added.durationMinutes).toBe(lastDuration);
  });
});
