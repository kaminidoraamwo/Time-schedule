import React from 'react';
import type { Step } from '../constants';

type Props = {
    steps: Step[];
    totalElapsedSeconds: number;
};

export const ProgressBar: React.FC<Props> = ({ steps, totalElapsedSeconds }) => {
    const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalDurationSeconds = totalDurationMinutes * 60;

    // Calculate width of each step in %
    const stepWidths = steps.map(s => (s.durationMinutes * 60 / totalDurationSeconds) * 100);

    // Calculate current progress in %
    const progressPercent = totalDurationSeconds > 0
        ? Math.min((totalElapsedSeconds / totalDurationSeconds) * 100, 100)
        : 0;

    return (
        <div className="w-full mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Start</span>
                <span>{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m</span>
            </div>

            <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden flex">
                {/* Background Segments */}
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        style={{ width: `${stepWidths[index]}%` }}
                        className={`h-full border-r border-white/50 flex items-center justify-center text-[10px] text-gray-400 ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}`}
                    >
                        {/* Show label only if wide enough */}
                        {step.durationMinutes > 15 && <span className="truncate px-1">{step.name}</span>}
                    </div>
                ))}

                {/* Progress Overlay */}
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500/50 transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                />

                {/* Current Time Indicator Line */}
                <div
                    className="absolute top-0 h-full w-1 bg-red-500 z-10 transition-all duration-1000 ease-linear"
                    style={{ left: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};
