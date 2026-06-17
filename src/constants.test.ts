import { describe, it, expect } from 'vitest';
import { TEMPLATES, SCHEDULE_STEPS } from './constants';
import { validateSchedule } from './utils/schedule';

describe('TEMPLATES', () => {
  it('includes the four core salon menus', () => {
    const names = TEMPLATES.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining(['縮毛矯正', 'カラー', 'パーマ', 'トリートメント']),
    );
  });

  it('has unique template ids', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks every template with isTemplate and an icon', () => {
    for (const template of TEMPLATES) {
      expect(template.isTemplate).toBe(true);
      expect(template.icon).toBeTruthy();
    }
  });

  it('only contains valid, non-empty schedules', () => {
    for (const template of TEMPLATES) {
      expect(template.steps.length).toBeGreaterThan(0);
      expect(validateSchedule(template.steps).isValid).toBe(true);
    }
  });

  it('uses unique step ids within each template', () => {
    for (const template of TEMPLATES) {
      const ids = template.steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('reuses the existing 縮毛矯正 schedule (12 steps)', () => {
    const straightening = TEMPLATES.find((t) => t.name === '縮毛矯正');
    expect(straightening?.steps).toEqual(SCHEDULE_STEPS);
    expect(SCHEDULE_STEPS).toHaveLength(12);
  });
});
