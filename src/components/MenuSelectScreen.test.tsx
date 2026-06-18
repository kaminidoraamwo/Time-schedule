import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuSelectScreen } from './MenuSelectScreen';
import type { Preset } from '../types';

const noop = () => {};

const templates: Preset[] = [
  { id: 't1', name: '縮毛矯正', icon: '💧', steps: [{ id: 1, name: '塗布', durationMinutes: 30 }] },
];
const presets: Preset[] = [
  { id: 'p1', name: 'いつもの', steps: [{ id: 1, name: '塗布', durationMinutes: 30 }] },
];

const baseProps = {
  templates,
  presets,
  menuName: '標準メニュー',
  isMenuDirty: false,
  currentStepsCount: 5,
  currentTotalMinutes: 90,
  onSelectTemplate: noop,
  onSavePreset: noop,
  onLoadPreset: noop,
  onDeletePreset: noop,
  onProceedWithCurrent: noop,
  onOpenHistory: noop,
};

describe('MenuSelectScreen', () => {
  it('does not apply a template on a single card tap (select-then-next)', async () => {
    const onSelectTemplate = vi.fn();
    render(<MenuSelectScreen {...baseProps} onSelectTemplate={onSelectTemplate} />);

    await userEvent.click(screen.getByText('縮毛矯正'));

    // タップ段階では適用されない
    expect(onSelectTemplate).not.toHaveBeenCalled();
    // 「次へ」ボタンが選択名を反映する
    expect(screen.getByRole('button', { name: /『縮毛矯正』で次へ/ })).toBeEnabled();
  });

  it('applies the selected template only after pressing 次へ', async () => {
    const onSelectTemplate = vi.fn();
    render(<MenuSelectScreen {...baseProps} onSelectTemplate={onSelectTemplate} />);

    await userEvent.click(screen.getByText('縮毛矯正'));
    await userEvent.click(screen.getByRole('button', { name: /で次へ/ }));

    expect(onSelectTemplate).toHaveBeenCalledWith('t1');
  });

  it('applies the selected preset only after pressing 次へ', async () => {
    const onLoadPreset = vi.fn();
    render(<MenuSelectScreen {...baseProps} onLoadPreset={onLoadPreset} />);

    await userEvent.click(screen.getByText('いつもの'));
    expect(onLoadPreset).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /で次へ/ }));
    expect(onLoadPreset).toHaveBeenCalledWith('p1');
  });

  it('disables 次へ until something is selected', () => {
    render(<MenuSelectScreen {...baseProps} />);
    expect(screen.getByRole('button', { name: 'メニューを選んでください' })).toBeDisabled();
  });

  it('lets the user proceed with the current settings', async () => {
    const onProceedWithCurrent = vi.fn();
    render(<MenuSelectScreen {...baseProps} onProceedWithCurrent={onProceedWithCurrent} />);
    await userEvent.click(screen.getByText(/今の設定のまま進む/));
    expect(onProceedWithCurrent).toHaveBeenCalledOnce();
  });

  it('hides the proceed control when there are no current steps', () => {
    render(<MenuSelectScreen {...baseProps} currentStepsCount={0} currentTotalMinutes={0} />);
    expect(screen.queryByText(/今の設定のまま進む/)).not.toBeInTheDocument();
  });

  it('confirms before deleting a preset', async () => {
    const onDeletePreset = vi.fn();
    render(<MenuSelectScreen {...baseProps} onDeletePreset={onDeletePreset} />);

    await userEvent.click(screen.getByLabelText('プリセット「いつもの」を削除'));
    expect(onDeletePreset).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '削除する' }));
    expect(onDeletePreset).toHaveBeenCalledWith('p1');
  });
});
