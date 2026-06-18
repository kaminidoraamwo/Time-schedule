import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetManager } from './PresetManager';
import type { Preset } from '../../types';

const samplePresets: Preset[] = [
  {
    id: 'p1',
    name: 'いつもの縮毛',
    steps: [
      { id: 1, name: '1剤', durationMinutes: 20 },
      { id: 2, name: 'アイロン', durationMinutes: 40 },
    ],
  },
];

describe('PresetManager', () => {
  it('renders a card per saved preset with name, total time and step count', () => {
    render(
      <PresetManager
        presets={samplePresets}
        onSavePreset={() => {}}
        onLoadPreset={() => {}}
        onDeletePreset={() => {}}
      />
    );

    expect(screen.getByText('いつもの縮毛')).toBeInTheDocument();
    expect(screen.getByText('約1時間')).toBeInTheDocument();
    expect(screen.getByText('2工程')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no presets', () => {
    render(
      <PresetManager
        presets={[]}
        onSavePreset={() => {}}
        onLoadPreset={() => {}}
        onDeletePreset={() => {}}
      />
    );

    expect(screen.getByText(/保存したプリセットはまだありません/)).toBeInTheDocument();
  });

  it('calls onLoadPreset when a card is clicked', async () => {
    const onLoad = vi.fn();
    render(
      <PresetManager
        presets={samplePresets}
        onSavePreset={() => {}}
        onLoadPreset={onLoad}
        onDeletePreset={() => {}}
      />
    );

    await userEvent.click(screen.getByText('いつもの縮毛'));

    expect(onLoad).toHaveBeenCalledWith('p1');
  });

  it('calls onDeletePreset from the delete control without loading', async () => {
    const onLoad = vi.fn();
    const onDelete = vi.fn();
    render(
      <PresetManager
        presets={samplePresets}
        onSavePreset={() => {}}
        onLoadPreset={onLoad}
        onDeletePreset={onDelete}
      />
    );

    await userEvent.click(screen.getByLabelText('プリセット「いつもの縮毛」を削除'));

    expect(onDelete).toHaveBeenCalledWith('p1');
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('calls onSavePreset with the entered name and clears the input', async () => {
    const onSave = vi.fn();
    render(
      <PresetManager
        presets={[]}
        onSavePreset={onSave}
        onLoadPreset={() => {}}
        onDeletePreset={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('現在の設定を保存...');
    await userEvent.type(input, '新メニュー');
    await userEvent.click(screen.getByText('保存'));

    expect(onSave).toHaveBeenCalledWith('新メニュー');
    expect(input).toHaveValue('');
  });
});
