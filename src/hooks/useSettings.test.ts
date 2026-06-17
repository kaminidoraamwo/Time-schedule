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
    const color = TEMPLATES.find((t) => t.name === 'カラー')!;

    act(() => {
      result.current.applyTemplate(color.id);
    });

    expect(result.current.steps).toHaveLength(color.steps.length);
    expect(result.current.steps.map((s) => s.name)).toEqual(
      color.steps.map((s) => s.name),
    );
  });

  it('deep-copies template steps so the source template is never mutated', () => {
    const { result } = renderHook(() => useSettings());
    const perm = TEMPLATES.find((t) => t.name === 'パーマ')!;

    act(() => {
      result.current.applyTemplate(perm.id);
    });
    act(() => {
      result.current.updateStep(result.current.steps[0].id, 'durationMinutes', 999);
    });

    // 元テンプレートの定数は書き換わっていない
    expect(perm.steps[0].durationMinutes).not.toBe(999);
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
