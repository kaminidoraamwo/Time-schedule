import React from 'react';
import type { Step } from '../../types';
import { getTotalDurationMinutes, getEndTime, validateSchedule } from '../../utils/schedule';
import { formatClockTime } from '../../utils/time';

type Props = {
    steps: Step[];
    className?: string; // allow styling override
    showEndTime?: boolean; // 終了予定時刻（現在時刻＋合計）を表示するか
};

export const TotalDuration: React.FC<Props> = ({
    steps,
    className = 'mb-6 p-4 bg-cream-alt rounded-none border border-line',
    showEndTime = true,
}) => {
    const totalDurationMinutes = getTotalDurationMinutes(steps);
    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMinutes = totalDurationMinutes % 60;
    const validation = validateSchedule(steps);
    const endTime = showEndTime ? formatClockTime(getEndTime(new Date(), totalDurationMinutes)) : null;

    return (
        <div className={className}>
            <div className="flex justify-between items-center">
                <span className="text-ink-soft font-medium">合計時間</span>
                <span className="text-2xl font-bold text-ink">
                    {totalHours}時間 {totalMinutes}分
                </span>
            </div>
            <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-ink-soft">{steps.length} 工程</span>
                {endTime && (
                    <span className="text-sm text-ink-soft">
                        終了予定 <span className="font-bold text-ink">{endTime}</span>
                    </span>
                )}
            </div>
            {validation.warning && (
                <p className="text-sm text-accent mt-2">{validation.warning}</p>
            )}
            {validation.invalidStepIds.length > 0 && (
                <p className="text-sm text-red-500 mt-2">
                    時間が未設定の工程があります（1分以上にしてください）
                </p>
            )}
        </div>
    );
};
