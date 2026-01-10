import React, { useState } from 'react';
import type { Step } from '../constants';

type Props = {
    steps: Step[];
    totalElapsedSeconds: number;
};

export const ProgressBar: React.FC<Props> = ({ steps, totalElapsedSeconds }) => {
    const [selectedStep, setSelectedStep] = useState<{ step: Step; position: number } | null>(null);

    const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalDurationSeconds = totalDurationMinutes * 60;

    // Calculate width of each step in %
    const stepWidths = steps.map(s => (s.durationMinutes * 60 / totalDurationSeconds) * 100);

    // Calculate cumulative positions for tooltip placement
    const stepPositions = stepWidths.reduce<number[]>((acc, width, index) => {
        if (index === 0) {
            return [width / 2];
        }
        const previousEnd = stepWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
        return [...acc, previousEnd + width / 2];
    }, []);

    // Calculate current progress in %
    const progressPercent = totalDurationSeconds > 0
        ? Math.min((totalElapsedSeconds / totalDurationSeconds) * 100, 100)
        : 0;

    const handleStepClick = (step: Step, index: number) => {
        setSelectedStep(prev =>
            prev?.step.id === step.id ? null : { step, position: stepPositions[index] }
        );
    };

    return (
        <div className="w-full mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>開始</span>
                <span>{Math.floor(totalDurationMinutes / 60)}時間 {totalDurationMinutes % 60}分</span>
            </div>

            {/* Tooltip - outside overflow-hidden container */}
            {selectedStep && (
                <div
                    className="relative h-0 z-30"
                    style={{ marginLeft: `${selectedStep.position}%` }}
                >
                    <div className="absolute bottom-1 left-0 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        {selectedStep.step.name} ({selectedStep.step.durationMinutes}分)
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                </div>
            )}

            <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden flex">
                {/* Background Segments */}
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        style={{ width: `${stepWidths[index]}%` }}
                        className={`h-full border-r border-white/50 flex items-center justify-center text-[10px] text-gray-400 cursor-pointer hover:brightness-90 active:brightness-75 transition-all ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'} ${selectedStep?.step.id === step.id ? 'brightness-90' : ''}`}
                        onClick={() => handleStepClick(step, index)}
                    >
                        {/* Show label only if wide enough */}
                        {step.durationMinutes > 15 && <span className="truncate px-1">{step.name}</span>}
                    </div>
                ))}

                {/* Progress Overlay */}
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500/50 transition-all duration-1000 ease-linear pointer-events-none"
                    style={{ width: `${progressPercent}%` }}
                />

                {/* Current Time Indicator Line */}
                <div
                    className="absolute top-0 h-full w-1 bg-red-500 z-10 transition-all duration-1000 ease-linear pointer-events-none"
                    style={{ left: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};
