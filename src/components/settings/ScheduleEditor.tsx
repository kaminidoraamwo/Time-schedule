import React from 'react';
import type { Step } from '../../types';

type Props = {
    steps: Step[];
    invalidStepIds?: number[];
    onUpdateStep: (id: number, field: keyof Step, value: string | number) => void;
    onAddStep: () => void;
    onRemoveStep: (id: number) => void;
    onMoveStep: (index: number, direction: 'up' | 'down') => void;
};

export const ScheduleEditor: React.FC<Props> = ({
    steps,
    invalidStepIds = [],
    onUpdateStep,
    onAddStep,
    onRemoveStep,
    onMoveStep
}) => {
    return (
        <div>
            <h3 className="font-serif text-lg text-ink mb-3">スケジュール編集</h3>
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isInvalid = invalidStepIds.includes(step.id);
                    return (
                    <div key={step.id} className={`bg-cream-alt p-4 rounded-none border ${isInvalid ? 'border-red-400' : 'border-line'}`}>
                        <div className="flex flex-col gap-3">
                            {/* Row 1: Move Controls and Name */}
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => onMoveStep(index, 'up')}
                                        disabled={index === 0}
                                        className="text-ink-faint hover:text-ink disabled:opacity-30 p-1 transition-colors"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => onMoveStep(index, 'down')}
                                        disabled={index === steps.length - 1}
                                        className="text-ink-faint hover:text-ink disabled:opacity-30 p-1 transition-colors"
                                    >
                                        ▼
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs text-ink-soft mb-1">工程名</label>
                                    <input
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => onUpdateStep(step.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 bg-cream border border-line rounded-none focus:outline-none focus:ring-1 focus:ring-ink"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Duration Controls and Delete */}
                            <div className="flex items-end gap-4 pl-8">
                                <div>
                                    <label className="block text-xs text-ink-soft mb-1">時間設定 (分)</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const newVal = Math.max(1, step.durationMinutes - 1);
                                                onUpdateStep(step.id, 'durationMinutes', newVal);
                                            }}
                                            className="bg-cream border border-line hover:bg-cream-alt text-ink w-10 h-10 rounded-none flex items-center justify-center font-bold text-lg active:translate-y-0.5 transition-all"
                                        >
                                            -
                                        </button>

                                        <input
                                            type="number"
                                            value={step.durationMinutes}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val)) {
                                                    onUpdateStep(step.id, 'durationMinutes', Math.max(0, val));
                                                }
                                            }}
                                            className="w-14 h-10 bg-cream border border-line rounded-none text-center font-bold text-lg text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                                        />

                                        <button
                                            onClick={() => onUpdateStep(step.id, 'durationMinutes', step.durationMinutes + 1)}
                                            className="bg-cream border border-line hover:bg-cream-alt text-ink w-10 h-10 rounded-none flex items-center justify-center font-bold text-lg active:translate-y-0.5 transition-all"
                                        >
                                            +
                                        </button>

                                        <button
                                            onClick={() => onUpdateStep(step.id, 'durationMinutes', step.durationMinutes + 5)}
                                            className="bg-transparent border border-accent/50 hover:bg-accent/5 text-accent w-10 h-10 rounded-none ml-1 flex items-center justify-center font-bold text-sm active:translate-y-0.5 transition-all"
                                        >
                                            +5
                                        </button>
                                    </div>
                                </div>

                                <div className="h-10 flex items-center">
                                    <button
                                        onClick={() => onRemoveStep(step.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-none transition-colors w-10 h-full flex items-center justify-center"
                                        title="削除"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {isInvalid && (
                                <p className="text-sm text-red-500 pl-8">
                                    時間を1分以上に設定してください
                                </p>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>

            <button
                onClick={onAddStep}
                className="mt-6 w-full py-3 border border-dashed border-line text-ink-soft rounded-none hover:border-ink hover:text-ink transition-colors font-medium"
            >
                + ステップを追加
            </button>
        </div>
    );
};
