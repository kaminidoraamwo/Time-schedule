import React from 'react';
import type { Step } from '../../types';

type Props = {
    steps: Step[];
    className?: string; // allow styling override
};

export const TotalDuration: React.FC<Props> = ({ steps, className = "mb-6 p-4 bg-cream-alt rounded-none border border-line" }) => {
    const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMinutes = totalDurationMinutes % 60;

    return (
        <div className={className}>
            <div className="flex justify-between items-center">
                <span className="text-ink-soft font-medium">合計時間</span>
                <span className="text-2xl font-bold text-ink">
                    {totalHours}時間 {totalMinutes}分
                </span>
            </div>
            <div className="text-sm text-ink-soft mt-1">
                {steps.length} 工程
            </div>
        </div>
    );
};
