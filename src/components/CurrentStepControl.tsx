import React from 'react';
import type { Step } from '../types';
import { formatTimeMMSS } from '../utils/time';
import { getStepStatus } from '../utils/progressStatus';
import { useLongPress } from '../hooks/useLongPress';

// 円形プログレスリングの寸法（viewBox 220x220 / 半径95）
const RING_RADIUS = 95;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
    // 0除算ガード: 予定0分なら進捗比0（NaN防止）
    const progressRatio = plannedSeconds > 0 ? stepElapsedSeconds / plannedSeconds : 0;
    const overtimeSeconds = Math.max(0, stepElapsedSeconds - plannedSeconds);
    const remainingSeconds = Math.max(0, plannedSeconds - stepElapsedSeconds);

    // リングの充填率: 残り時間ぶんが満ちている。超過時は満タン(赤)で警告。
    const ringRatio = overtimeSeconds > 0
        ? 1
        : plannedSeconds > 0
            ? remainingSeconds / plannedSeconds
            : 0;

    // Use shared status utility
    const status = getStepStatus(progressRatio);

    // 一時停止中は背景をクリームに
    const bgColor = isPaused ? 'bg-cream-alt' : status.bgColor;

    return (
        <div className={`flex flex-col items-center justify-center p-5 rounded-none border border-line ${bgColor} transition-colors duration-500 ${className}`}>
            <div className="text-ink-soft text-sm mb-1">現在の工程</div>
            <h2 className="text-2xl font-medium text-ink mb-3 text-center">{step.name}</h2>

            {/* 円形リング: 経過時間を主役に、残り時間ぶんのリングが減っていく */}
            <div className={`relative w-56 h-56 mb-3 ${isPaused ? 'animate-pulse' : ''}`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                    <circle
                        cx="110" cy="110" r={RING_RADIUS}
                        fill="none" stroke="rgba(51,51,51,0.12)" strokeWidth="10"
                    />
                    <circle
                        cx="110" cy="110" r={RING_RADIUS}
                        fill="none" stroke="currentColor" strokeWidth="10"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={RING_CIRCUMFERENCE * (1 - ringRatio)}
                        className={isPaused ? 'text-ink-faint' : status.color}
                        style={{ transition: 'stroke-dashoffset 0.3s linear, stroke 0.4s' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xs text-ink-soft">経過</div>
                    <div className="text-6xl font-mono font-bold text-ink leading-none tracking-tighter">
                        {formatTimeMMSS(stepElapsedSeconds)}
                    </div>
                    <div className="w-12 h-px bg-line my-2" />
                    <div className="text-sm font-mono text-ink-soft">
                        {overtimeSeconds > 0
                            ? `超過 +${formatTimeMMSS(overtimeSeconds)}`
                            : `残り ${formatTimeMMSS(remainingSeconds)} / ${formatTimeMMSS(plannedSeconds)}`}
                    </div>
                    <div className={`text-base font-bold mt-1 ${isPaused ? 'text-ink-soft' : status.color}`}>
                        {isPaused ? '⏸ 一時停止中' : status.text}
                    </div>
                </div>
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
