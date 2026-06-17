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

describe('useSettings.duplicateStep', () => {
  beforeEach(() => localStorage.clear());

  it('inserts a copy directly after the source step with a fresh id', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.applyTemplate('tpl-treatment')); // 5工程
    const target = result.current.steps[1];

    act(() => result.current.duplicateStep(target.id));

    const ids = result.current.steps.map((s) => s.id);
    expect(result.current.steps).toHaveLength(6);
    // コピーは直後に入る
    expect(result.current.steps[2].name).toBe(target.name);
    expect(result.current.steps[2].durationMinutes).toBe(target.durationMinutes);
    // id は衝突しない
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('useSettings.addNamedStep', () => {
  beforeEach(() => localStorage.clear());

  it('appends a step with the given name and the previous step duration as default', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.applyTemplate('tpl-treatment'));
    const lastDuration = result.current.steps[result.current.steps.length - 1].durationMinutes;

    act(() => result.current.addNamedStep('カット'));

    const added = result.current.steps[result.current.steps.length - 1];
    expect(added.name).toBe('カット');
    expect(added.durationMinutes).toBe(lastDuration);
  });
});
