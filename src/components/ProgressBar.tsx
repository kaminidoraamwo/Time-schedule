import React, { useState } from 'react';
import type { Step } from '../types';
import { useProgressCalculation } from '../hooks/useProgressCalculation';

type Props = {
    steps: Step[];
    totalElapsedSeconds: number;
    currentStepIndex: number;
    stepElapsedSeconds: number;
};

// === Sub-components ===

type StepSegmentsProps = {
    steps: Step[];
    stepWidths: number[];
    isClickable?: boolean;
    onStepClick?: (step: Step, index: number) => void;
};

const StepSegments: React.FC<StepSegmentsProps> = ({
    steps,
    stepWidths,
    isClickable = false,
    onStepClick
}) => (
    <div className="absolute inset-0 flex">
        {steps.map((step, index) => (
            <div
                key={step.id}
                style={{ width: `${stepWidths[index]}%` }}
                className={`h-full border-r border-white/30 ${isClickable ? 'cursor-pointer hover:bg-white/20 transition-all' : ''
                    }`}
                onClick={isClickable ? () => onStepClick?.(step, index) : undefined}
            />
        ))}
    </div>
);

type BackgroundSegmentsProps = {
    steps: Step[];
    stepWidths: number[];
};

const BackgroundSegments: React.FC<BackgroundSegmentsProps> = ({ steps, stepWidths }) => (
    <div className="absolute inset-0 flex">
        {steps.map((step, index) => (
            <div
                key={`bg-${step.id}`}
                style={{ width: `${stepWidths[index]}%` }}
                className={`h-full ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}`}
            />
        ))}
    </div>
);

type ProgressFillProps = {
    percent: number;
    colorClass: string;
};

const ProgressFill: React.FC<ProgressFillProps> = ({ percent, colorClass }) => (
    <div
        className={`absolute top-0 left-0 h-full ${colorClass} transition-all duration-200 ease-linear`}
        style={{ width: `${percent}%` }}
    />
);

type TooltipProps = {
    step: Step;
    position: number;
};

const Tooltip: React.FC<TooltipProps> = ({ step, position }) => {
    const positionClass = position < 20
        ? 'left-0'
        : position > 80
            ? 'right-0'
            : 'left-0 -translate-x-1/2';

    const arrowClass = position < 20
        ? 'left-4'
        : position > 80
            ? 'right-4'
            : 'left-1/2 -translate-x-1/2';

    return (
        <div
            className="relative h-0 z-30"
            style={{ marginLeft: `${position}%` }}
        >
            <div className={`absolute bottom-1 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap ${positionClass}`}>
                {step.name} ({step.durationMinutes}分)
                <div className={`absolute top-full border-4 border-transparent border-t-gray-800 ${arrowClass}`} />
            </div>
        </div>
    );
};

// === Main Component ===

export const ProgressBar: React.FC<Props> = ({
    steps,
    totalElapsedSeconds,
    currentStepIndex,
    stepElapsedSeconds,
}) => {
    const [selectedStep, setSelectedStep] = useState<{ step: Step; position: number } | null>(null);

    const {
        stepWidths,
        stepPositions,
        totalDurationSeconds,
        scheduleProgressPercent,
        actualProgressPercent,
        status,
        scheduleBarColor,
    } = useProgressCalculation(steps, totalElapsedSeconds, currentStepIndex, stepElapsedSeconds);

    const totalDurationMinutes = totalDurationSeconds / 60;

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

            {/* Tooltip */}
            {selectedStep && <Tooltip step={selectedStep.step} position={selectedStep.position} />}

            {/* Dual Progress Bars */}
            <div className="space-y-2">
                {/* Schedule Bar (予定) */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8 text-right font-medium">予定</span>
                    <div className="flex-1 relative h-6 rounded-full overflow-hidden">
                        <BackgroundSegments steps={steps} stepWidths={stepWidths} />
                        <ProgressFill percent={scheduleProgressPercent} colorClass={scheduleBarColor} />
                        <StepSegments
                            steps={steps}
                            stepWidths={stepWidths}
                            isClickable
                            onStepClick={handleStepClick}
                        />
                    </div>
                </div>

                {/* Actual Bar (実際) */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8 text-right font-medium">実際</span>
                    <div className="flex-1 relative h-6 rounded-full overflow-hidden">
                        <BackgroundSegments steps={steps} stepWidths={stepWidths} />
                        <ProgressFill percent={actualProgressPercent} colorClass={status.barColor} />
                        <StepSegments steps={steps} stepWidths={stepWidths} />
                    </div>
                </div>
            </div>

            {/* Status Message */}
            <div className={`mt-3 px-4 py-2 rounded-lg ${status.bgColor} ${status.textColor} text-sm font-medium text-center`}>
                {status.message}
            </div>
        </div>
    );
};
