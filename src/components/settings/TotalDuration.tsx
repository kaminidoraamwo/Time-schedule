import React from 'react';
import type { Step } from '../../constants';

type Props = {
    steps: Step[];
    className?: string; // allow styling override
};

export const TotalDuration: React.FC<Props> = ({ steps, className = "mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200" }) => {
    const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMinutes = totalDurationMinutes % 60;

    return (
        <div className={className}>
            <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">合計時間</span>
                <span className="text-2xl font-bold text-gray-800">
                    {totalHours}時間 {totalMinutes}分
                </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
                {steps.length} 工程
            </div>
        </div>
    );
};
