import React, { useState } from 'react';
import type { Step } from '../constants';

type Props = {
    steps: Step[];
    totalElapsedSeconds: number;
    currentStepIndex: number;
    stepElapsedSeconds: number;
    completedSteps: { actualDuration: number }[];
};

// Format seconds to natural language
const formatDiffNatural = (seconds: number): string => {
    const abs = Math.abs(Math.round(seconds));
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;

    if (mins === 0) {
        return `${secs}秒`;
    } else if (secs === 0) {
        return `${mins}分`;
    } else {
        return `${mins}分${secs}秒`;
    }
};

export const ProgressBar: React.FC<Props> = ({
    steps,
    totalElapsedSeconds,
    currentStepIndex,
    stepElapsedSeconds,
    // completedSteps - reserved for future use
}) => {
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

    // === Schedule Progress (constant speed) ===
    const scheduleProgressPercent = totalDurationSeconds > 0
        ? Math.min((totalElapsedSeconds / totalDurationSeconds) * 100, 100)
        : 0;

    // === Actual Progress (based on completed steps + current step) ===
    const completedPlannedSeconds = steps
        .slice(0, currentStepIndex)
        .reduce((acc, s) => acc + s.durationMinutes * 60, 0);

    const currentStepPlannedSeconds = steps[currentStepIndex]?.durationMinutes * 60 || 0;
    const currentStepProgressRatio = currentStepPlannedSeconds > 0
        ? Math.min(stepElapsedSeconds / currentStepPlannedSeconds, 1)
        : 0;

    const actualPlannedSeconds = completedPlannedSeconds + (currentStepPlannedSeconds * currentStepProgressRatio);
    const actualProgressPercent = totalDurationSeconds > 0
        ? Math.min((actualPlannedSeconds / totalDurationSeconds) * 100, 100)
        : 0;

    // === Difference Calculation ===
    const diffSeconds = actualPlannedSeconds - totalElapsedSeconds;
    const diffPercent = totalDurationSeconds > 0
        ? ((actualPlannedSeconds - totalElapsedSeconds) / totalDurationSeconds) * 100
        : 0;

    // === Color & Status Logic ===
    let scheduleBarColor = 'bg-gray-400';
    let actualBarColor = 'bg-green-500';
    let statusBgColor = 'bg-green-100';
    let statusTextColor = 'text-green-700';
    let statusMessage = '順調なペースです 👍';

    if (diffPercent > 0) {
        // Ahead of schedule
        actualBarColor = 'bg-blue-500';
        statusBgColor = 'bg-blue-100';
        statusTextColor = 'text-blue-700';
        statusMessage = `予定より ${formatDiffNatural(diffSeconds)} 早いペースです 👍`;
    } else if (diffPercent <= -20) {
        // Very late
        actualBarColor = 'bg-red-500';
        statusBgColor = 'bg-red-100';
        statusTextColor = 'text-red-700';
        statusMessage = `${formatDiffNatural(Math.abs(diffSeconds))} 遅れています ⚠️`;
    } else if (diffPercent <= -10) {
        // Slightly late
        actualBarColor = 'bg-amber-500';
        statusBgColor = 'bg-amber-100';
        statusTextColor = 'text-amber-700';
        statusMessage = `${formatDiffNatural(Math.abs(diffSeconds))} 遅れています`;
    } else if (diffPercent < 0) {
        // Minor delay (within 10%)
        statusMessage = `少し遅れ気味です（${formatDiffNatural(Math.abs(diffSeconds))}）`;
    }

    const handleStepClick = (step: Step, index: number) => {
        setSelectedStep(prev =>
            prev?.step.id === step.id ? null : { step, position: stepPositions[index] }
        );
    };

    return (
        <div className="w-full mb-6">
            {/* Time labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
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

            {/* Dual Progress Bars */}
            <div className="space-y-2">
                {/* Schedule Bar (予定) */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8 text-right font-medium">予定</span>
                    <div className="flex-1 relative h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 h-full ${scheduleBarColor} transition-all duration-200 ease-linear`}
                            style={{ width: `${scheduleProgressPercent}%` }}
                        />
                        {/* Step segments (clickable) */}
                        <div className="absolute inset-0 flex">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    style={{ width: `${stepWidths[index]}%` }}
                                    className="h-full border-r border-white/30 cursor-pointer hover:bg-white/20 transition-all"
                                    onClick={() => handleStepClick(step, index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actual Bar (実際) */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8 text-right font-medium">実際</span>
                    <div className="flex-1 relative h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 h-full ${actualBarColor} transition-all duration-200 ease-linear`}
                            style={{ width: `${actualProgressPercent}%` }}
                        />
                        {/* Step segments (for visual consistency) */}
                        <div className="absolute inset-0 flex">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    style={{ width: `${stepWidths[index]}%` }}
                                    className="h-full border-r border-white/30"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Message (Natural Language) */}
            <div className={`mt-3 px-4 py-2 rounded-lg ${statusBgColor} ${statusTextColor} text-sm font-medium text-center`}>
                {statusMessage}
            </div>
        </div>
    );
};
