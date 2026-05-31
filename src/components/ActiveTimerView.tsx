import React from 'react';
import type { Step } from '../types';
import { ProgressBar } from './ProgressBar';
import { CurrentStepControl, LongPressButton } from './CurrentStepControl';
import { formatTimeHMMSS, formatClockTime } from '../utils/time';

type Props = {
    steps: Step[];
    currentStepIndex: number;
    currentStep: Step | undefined;
    totalElapsedSeconds: number;
    stepElapsedSeconds: number;
    isPaused: boolean;
    totalDurationMinutes: number;
    onNextStep: () => void;
    onPreviousStep: () => void;
    onTogglePause: () => void;
    onSkipToFinish: () => void;
};

export const ActiveTimerView: React.FC<Props> = ({
    steps,
    currentStepIndex,
    currentStep,
    totalElapsedSeconds,
    stepElapsedSeconds,
    isPaused,
    totalDurationMinutes,
    onNextStep,
    onPreviousStep,
    onTogglePause,
    onSkipToFinish,
}) => {
    // 完了予定時刻 = 現在時刻 + 残り時間（現工程の残り + 以降の工程の予定合計）
    const currentPlannedSeconds = (currentStep?.durationMinutes ?? 0) * 60;
    const remainingCurrentStep = Math.max(0, currentPlannedSeconds - stepElapsedSeconds);
    const futureStepsSeconds = steps
        .slice(currentStepIndex + 1)
        .reduce((acc, s) => acc + s.durationMinutes * 60, 0);
    const remainingTotalSeconds = remainingCurrentStep + futureStepsSeconds;
    const finishAt = new Date(Date.now() + remainingTotalSeconds * 1000);

    return (
        <div className="flex flex-col h-full">
            <ProgressBar
                steps={steps}
                totalElapsedSeconds={totalElapsedSeconds}
                currentStepIndex={currentStepIndex}
                stepElapsedSeconds={stepElapsedSeconds}
            />

            <div className="flex-grow flex flex-col items-center pb-6">
                {currentStep && (
                    <>
                        <CurrentStepControl
                            step={currentStep}
                            stepElapsedSeconds={stepElapsedSeconds}
                            onNext={onNextStep}
                            onBack={onPreviousStep}
                            isPaused={isPaused}
                            isLastStep={currentStepIndex === steps.length - 1}
                            isFirstStep={currentStepIndex === 0}
                            nextStep={steps[currentStepIndex + 1]}
                            className="w-full"
                        />

                        <div className="flex flex-col items-center justify-evenly w-full flex-grow mt-6 gap-2">
                            {/* 完了予定の時刻 */}
                            <div className="flex items-baseline gap-3 px-5 py-2 bg-cream border border-line rounded-none">
                                <span className="text-ink-soft text-xs">🏁 完了予定</span>
                                <span className="text-2xl font-bold text-ink font-mono tracking-tight tabular-nums">
                                    {formatClockTime(finishAt)}
                                </span>
                            </div>

                            <div className="flex flex-col items-center p-3 bg-cream-alt border border-line rounded-none">
                                <div className="text-ink-soft text-xs font-medium mb-0.5">経過時間 / 合計予定</div>
                                <div className="text-2xl font-bold text-ink font-mono tracking-tight">
                                    {formatTimeHMMSS(totalElapsedSeconds)}
                                    <span className="text-ink-faint mx-2 text-lg align-middle">/</span>
                                    {formatTimeHMMSS(totalDurationMinutes * 60)}
                                </div>
                            </div>

                            {/* 一時停止ボタン */}
                            <LongPressButton
                                onAction={onTogglePause}
                                progressColor={isPaused ? 'bg-cream/50' : 'bg-ink/40'}
                                className={`px-6 py-2 rounded-none text-sm font-medium transition-colors mt-2 ${
                                    isPaused
                                        ? 'bg-forest hover:opacity-90 text-cream'
                                        : 'bg-transparent border border-ink/40 hover:bg-ink/5 text-ink-soft'
                                }`}
                            >
                                {isPaused ? '▶ 再開（長押し）' : '⏸ 一時停止（長押し）'}
                            </LongPressButton>

                            <LongPressButton
                                onAction={onSkipToFinish}
                                progressColor="bg-red-400"
                                className="px-4 py-1.5 border border-red-300 text-red-500 rounded-none text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors mt-6"
                            >
                                強制終了（長押し）
                            </LongPressButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
