import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartScreen } from './StartScreen';

const noop = () => {};

describe('StartScreen', () => {
  it('enables start for a valid schedule', () => {
    render(
      <StartScreen stepsCount={3} totalDurationMinutes={60} canStart onStart={noop} onOpenHistory={noop} />,
    );
    expect(screen.getByRole('button', { name: 'スタート' })).toBeEnabled();
  });

  it('disables start and explains why when there are no steps', () => {
    render(
      <StartScreen stepsCount={0} totalDurationMinutes={0} canStart={false} onStart={noop} onOpenHistory={noop} />,
    );
    expect(screen.getByRole('button', { name: 'スタート' })).toBeDisabled();
    expect(screen.getByText('工程を1つ以上設定してください')).toBeInTheDocument();
  });

  it('disables start when a step has no duration', () => {
    render(
      <StartScreen stepsCount={3} totalDurationMinutes={40} canStart={false} onStart={noop} onOpenHistory={noop} />,
    );
    expect(screen.getByRole('button', { name: 'スタート' })).toBeDisabled();
    expect(screen.getByText(/時間が未設定の工程があります/)).toBeInTheDocument();
  });

  it('calls onStart when started', async () => {
    const onStart = vi.fn();
    render(
      <StartScreen stepsCount={3} totalDurationMinutes={60} canStart onStart={onStart} onOpenHistory={noop} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'スタート' }));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
