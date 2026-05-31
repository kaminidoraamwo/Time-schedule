import React from 'react';
import type { Step } from '../types';
import { formatTimeMMSS } from '../utils/time';
import { getStepStatus } from '../utils/progressStatus';
import { useLongPress } from '../hooks/useLongPress';

type Props = {
    step: Step;
    stepElapsedSeconds: number;
    onNext: () => void;
    onBack: () => void;
    isPaused: boolean;
    isLastStep: boolean;
    isFirstStep: boolean;
    nextStep?: Step;
    className?: string;
};

/**
 * 長押しボタンコンポーネント
 * 押している間にプログレスバーが表示される
 */
export const LongPressButton: React.FC<{
    onAction: () => void;
    disabled?: boolean;
    className: string;
    progressColor: string;
    children: React.ReactNode;
}> = ({ onAction, disabled, className, progressColor, children }) => {
    const { handlers, progress, isPressed } = useLongPress(onAction);

    // disabled の場合はハンドラーを無効化
    const activeHandlers = disabled ? {} : handlers;

    return (
        <button
            {...activeHandlers}
            disabled={disabled}
            className={`${className} relative overflow-hidden select-none`}
            // 通常のクリックを無効化（長押しのみ）
            onClick={(e) => e.preventDefault()}
        >
            {/* 長押しプログレスバー */}
            {isPressed && !disabled && (
                <div
                    className={`absolute bottom-0 left-0 h-1 ${progressColor} transition-none`}
                    style={{ width: `${progress * 100}%` }}
                />
            )}
            {children}
        </button>
    );
};

export const CurrentStepControl: React.FC<Props> = ({
    step,
    stepElapsedSeconds,
    onNext,
    onBack,
    isPaused,
    isLastStep,
    isFirstStep,
    nextStep,
    className = '',
}) => {
    const plannedSeconds = step.durationMinutes * 60;
    const progressRatio = stepElapsedSeconds / plannedSeconds;
    const overtimeSeconds = Math.max(0, stepElapsedSeconds - plannedSeconds);

    // Use shared status utility
    const status = getStepStatus(progressRatio);

    // 一時停止中は背景をクリームに
    const bgColor = isPaused ? 'bg-cream-alt' : status.bgColor;

    return (
        <div className={`flex flex-col items-center justify-center p-5 rounded-none border border-line ${bgColor} transition-colors duration-500 ${className}`}>
            <div className="text-ink-soft text-sm mb-1">現在の工程</div>
            <h2 className="text-2xl font-medium text-ink mb-3 text-center">{step.name}</h2>

            <div className={`text-7xl font-mono font-bold text-ink mb-1 tracking-tighter ${isPaused ? 'animate-pulse' : ''}`}>
                {formatTimeMMSS(stepElapsedSeconds)}
            </div>

            <div className={`text-lg font-bold mb-3 ${isPaused ? 'text-ink-soft' : status.color} flex items-center gap-2`}>
                {isPaused ? (
                    <span>⏸ 一時停止中</span>
                ) : (
                    <>
                        <span>{status.text}</span>
                        {overtimeSeconds > 0 && (
                            <span>(+{formatTimeMMSS(overtimeSeconds)})</span>
                        )}
                        {overtimeSeconds === 0 && (
                            <span className="text-ink-faint text-sm">/ {formatTimeMMSS(plannedSeconds)}</span>
                        )}
                    </>
                )}
            </div>

            <div className="flex gap-3 w-full max-w-md justify-center">
                <LongPressButton
                    onAction={onBack}
                    disabled={isFirstStep}
                    progressColor="bg-ink/40"
                    className="bg-transparent border border-ink/40 hover:bg-ink/5 disabled:opacity-30 text-ink text-lg font-medium py-4 px-5 rounded-none transition-colors flex items-center gap-1"
                >
                    <span>◀</span>
                    <span>戻る</span>
                </LongPressButton>

                <LongPressButton
                    onAction={onNext}
                    progressColor="bg-cream/50"
                    className="flex-1 bg-ink hover:opacity-90 text-cream font-medium py-3 px-6 rounded-none transition-opacity flex flex-col items-center justify-center gap-0.5"
                >
                    <span className="text-xl flex items-center gap-1">{isLastStep ? '終了' : '次へ'} <span>▶</span></span>
                    {nextStep && (
                        <span className="text-xs font-normal opacity-90">
                            次は {nextStep.name} ({nextStep.durationMinutes}分)
                        </span>
                    )}
                </LongPressButton>
            </div>
        </div>
    );
};
