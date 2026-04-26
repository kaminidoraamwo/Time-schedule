import React from 'react';
import type { Step } from '../types';
import { formatTimeMMSS } from '../utils/time';
import { getStepStatus } from '../utils/progressStatus';

type Props = {
    step: Step;
    stepElapsedSeconds: number;
    onNext: () => void;
    onBack: () => void;
    onTogglePause: () => void;
    isPaused: boolean;
    isLastStep: boolean;
    isFirstStep: boolean;
    nextStep?: Step;
};

export const CurrentStepControl: React.FC<Props> = ({
    step,
    stepElapsedSeconds,
    onNext,
    onBack,
    onTogglePause,
    isPaused,
    isLastStep,
    isFirstStep,
    nextStep,
}) => {
    const plannedSeconds = step.durationMinutes * 60;
    const progressRatio = stepElapsedSeconds / plannedSeconds;
    const overtimeSeconds = Math.max(0, stepElapsedSeconds - plannedSeconds);

    // Use shared status utility
    const status = getStepStatus(progressRatio);

    // 一時停止中は背景をグレーに
    const bgColor = isPaused ? 'bg-gray-200' : status.bgColor;

    return (
        <div className={`flex flex-col items-center justify-center p-8 rounded-3xl shadow-lg ${bgColor} transition-colors duration-500`}>
            <div className="text-gray-500 text-lg mb-2">現在の工程</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{step.name}</h2>

            <div className={`text-8xl font-mono font-bold text-gray-900 mb-2 tracking-tighter ${isPaused ? 'animate-pulse' : ''}`}>
                {formatTimeMMSS(stepElapsedSeconds)}
            </div>

            <div className={`text-xl font-bold mb-4 ${isPaused ? 'text-gray-500' : status.color} flex items-center gap-2`}>
                {isPaused ? (
                    <span>⏸ 一時停止中</span>
                ) : (
                    <>
                        <span>{status.text}</span>
                        {overtimeSeconds > 0 && (
                            <span>(+{formatTimeMMSS(overtimeSeconds)})</span>
                        )}
                        {overtimeSeconds === 0 && (
                            <span className="text-gray-400 text-sm">/ {formatTimeMMSS(plannedSeconds)}</span>
                        )}
                    </>
                )}
            </div>

            {/* 一時停止/再開ボタン */}
            <button
                onClick={onTogglePause}
                className={`mb-6 px-6 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                    isPaused
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                        : 'bg-gray-400/30 hover:bg-gray-400/50 text-gray-600'
                }`}
            >
                {isPaused ? '▶ 再開' : '⏸ 一時停止'}
            </button>

            <div className="flex gap-4 w-full max-w-md justify-center">
                <button
                    onClick={onBack}
                    disabled={isFirstStep}
                    className="bg-gray-300 hover:bg-gray-400 disabled:opacity-30 text-gray-700 text-lg font-bold py-6 px-6 rounded-2xl shadow-md active:transform active:scale-95 transition-all flex items-center gap-1"
                >
                    <span>◀</span>
                    <span>戻る</span>
                </button>

                <button
                    onClick={onNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-md active:transform active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                >
                    <span className="text-2xl flex items-center gap-1">{isLastStep ? '終了' : '次へ'} <span>▶</span></span>
                    {nextStep && (
                        <span className="text-sm font-normal opacity-90">
                            次は {nextStep.name} ({nextStep.durationMinutes}分)
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};
