import { useMemo } from 'react';
import type { Step } from '../types';
import { getProgressStatus } from '../utils/progressStatus';
import type { ProgressStatus } from '../types';

type ProgressCalculationResult = {
    // Step layout
    stepWidths: number[];
    stepPositions: number[];
    totalDurationSeconds: number;

    // Progress percentages
    scheduleProgressPercent: number;
    actualProgressPercent: number;

    // Status
    status: ProgressStatus;
    scheduleBarColor: string;
};

/**
 * Custom hook to calculate progress bar values
 * Extracts calculation logic from ProgressBar component
 */
export const useProgressCalculation = (
    steps: Step[],
    totalElapsedSeconds: number,
    currentStepIndex: number,
    stepElapsedSeconds: number
): ProgressCalculationResult => {
    return useMemo(() => {
        const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
        const totalDurationSeconds = totalDurationMinutes * 60;

        // Calculate width of each step in %
        const stepWidths = steps.map(s =>
            (s.durationMinutes * 60 / totalDurationSeconds) * 100
        );

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

        // Get status from shared utility
        const status = getProgressStatus(diffPercent, diffSeconds);

        return {
            stepWidths,
            stepPositions,
            totalDurationSeconds,
            scheduleProgressPercent,
            actualProgressPercent,
            status,
            scheduleBarColor: 'bg-gray-400',
        };
    }, [steps, totalElapsedSeconds, currentStepIndex, stepElapsedSeconds]);
};
