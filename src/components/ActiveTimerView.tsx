import React from 'react';
import type { Step } from '../types';
import { ProgressBar } from './ProgressBar';
import { CurrentStepControl, LongPressButton } from './CurrentStepControl';
import { formatTimeHMMSS } from '../utils/time';

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
                            <div className="flex flex-col items-center p-3 bg-white/50 rounded-xl">
                                <div className="text-gray-500 text-xs font-medium mb-0.5">経過時間 / 合計予定</div>
                                <div className="text-2xl font-bold text-gray-700 font-mono tracking-tight">
                                    {formatTimeHMMSS(totalElapsedSeconds)}
                                    <span className="text-gray-400 mx-2 text-lg align-middle">/</span>
                                    {formatTimeHMMSS(totalDurationMinutes * 60)}
                                </div>
                            </div>

                            {/* 一時停止ボタン */}
                            <LongPressButton
                                onAction={onTogglePause}
                                progressColor={isPaused ? 'bg-green-300' : 'bg-gray-500'}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all mt-2 ${
                                    isPaused
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                        : 'bg-gray-400/30 hover:bg-gray-400/50 text-gray-600'
                                }`}
                            >
                                {isPaused ? '▶ 再開（長押し）' : '⏸ 一時停止（長押し）'}
                            </LongPressButton>

                            <LongPressButton
                                onAction={onSkipToFinish}
                                progressColor="bg-red-400"
                                className="px-4 py-1.5 border border-red-200 text-red-400 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors mt-6"
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
