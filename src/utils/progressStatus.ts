import { formatDiffNatural } from './time';
import type { ProgressStatus, StepStatus } from '../types';

/**
 * Calculate progress status based on difference percentage
 * Used by ProgressBar for overall session status
 */
export const getProgressStatus = (diffPercent: number, diffSeconds: number): ProgressStatus => {
    if (diffPercent > 0) {
        // Ahead of schedule
        return {
            level: 'ahead',
            barColor: 'bg-blue-500',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-700',
            message: `予定より ${formatDiffNatural(diffSeconds)} 早いペースです 👍`,
        };
    } else if (diffPercent <= -20) {
        // Very late
        return {
            level: 'veryLate',
            barColor: 'bg-red-500',
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            message: `${formatDiffNatural(Math.abs(diffSeconds))} 遅れています ⚠️`,
        };
    } else if (diffPercent <= -10) {
        // Slightly late
        return {
            level: 'slightlyLate',
            barColor: 'bg-amber-500',
            bgColor: 'bg-amber-100',
            textColor: 'text-amber-700',
            message: `${formatDiffNatural(Math.abs(diffSeconds))} 遅れています`,
        };
    } else if (diffPercent < 0) {
        // Minor delay (within 10%)
        return {
            level: 'onTime',
            barColor: 'bg-green-500',
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            message: `少し遅れ気味です（${formatDiffNatural(Math.abs(diffSeconds))}）`,
        };
    }

    // On time
    return {
        level: 'onTime',
        barColor: 'bg-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        message: '順調なペースです 👍',
    };
};

/**
 * Calculate step-level status based on progress ratio
 * Used by CurrentStepControl for individual step status
 */
export const getStepStatus = (progressRatio: number): StepStatus => {
    if (progressRatio > 1.0) {
        return {
            level: 'late',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            text: '遅延',
        };
    } else if (progressRatio > 0.8) {
        return {
            level: 'warning',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            text: '注意',
        };
    }

    return {
        level: 'good',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        text: '順調',
    };
};
