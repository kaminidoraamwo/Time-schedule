import React from 'react';
import type { Step } from '../constants';

type Props = {
    step: Step;
    stepElapsedSeconds: number;
    onNext: () => void;
    isLastStep: boolean;
};

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const CurrentStepControl: React.FC<Props> = ({ step, stepElapsedSeconds, onNext, isLastStep }) => {
    const plannedSeconds = step.durationMinutes * 60;
    const progressRatio = stepElapsedSeconds / plannedSeconds;

    let statusColor = 'text-green-600';
    let bgColor = 'bg-green-50';
    let statusText = '順調';

    if (progressRatio > 1.0) {
        statusColor = 'text-red-600';
        bgColor = 'bg-red-50';
        statusText = '遅延';
    } else if (progressRatio > 0.8) {
        statusColor = 'text-yellow-600';
        bgColor = 'bg-yellow-50';
        statusText = '注意';
    }

    // const remainingSeconds = Math.max(0, plannedSeconds - stepElapsedSeconds);
    const overtimeSeconds = Math.max(0, stepElapsedSeconds - plannedSeconds);

    return (
        <div className={`flex flex-col items-center justify-center p-8 rounded-3xl shadow-lg ${bgColor} transition-colors duration-500`}>
            <div className="text-gray-500 text-lg mb-2">Current Step</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{step.name}</h2>

            <div className="text-8xl font-mono font-bold text-gray-900 mb-2 tracking-tighter">
                {formatTime(stepElapsedSeconds)}
            </div>

            <div className={`text-xl font-bold mb-8 ${statusColor} flex items-center gap-2`}>
                <span>{statusText}</span>
                {overtimeSeconds > 0 && (
                    <span>(+{formatTime(overtimeSeconds)})</span>
                )}
                {overtimeSeconds === 0 && (
                    <span className="text-gray-400 text-sm">/ {formatTime(plannedSeconds)}</span>
                )}
            </div>

            <button
                onClick={onNext}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-6 px-8 rounded-2xl shadow-md active:transform active:scale-95 transition-all"
            >
                {isLastStep ? 'Finish' : 'Next Step'}
            </button>
        </div>
    );
};
