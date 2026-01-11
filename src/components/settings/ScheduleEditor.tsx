import React from 'react';
import type { Step } from '../../constants';

type Props = {
    steps: Step[];
    onUpdateStep: (id: number, field: keyof Step, value: string | number) => void;
    onAddStep: () => void;
    onRemoveStep: (id: number) => void;
    onMoveStep: (index: number, direction: 'up' | 'down') => void;
};

export const ScheduleEditor: React.FC<Props> = ({
    steps,
    onUpdateStep,
    onAddStep,
    onRemoveStep,
    onMoveStep
}) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">スケジュール編集</h3>
            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col gap-3">
                            {/* Row 1: Move Controls and Name */}
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => onMoveStep(index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30 p-1"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => onMoveStep(index, 'down')}
                                        disabled={index === steps.length - 1}
                                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30 p-1"
                                    >
                                        ▼
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">工程名</label>
                                    <input
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => onUpdateStep(step.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Duration Controls and Delete */}
                            <div className="flex items-end gap-4 pl-8">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">時間設定 (分)</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const newVal = Math.max(1, step.durationMinutes - 1);
                                                onUpdateStep(step.id, 'durationMinutes', newVal);
                                            }}
                                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 w-10 h-10 rounded shadow-sm flex items-center justify-center font-bold text-lg active:translate-y-0.5 transition-all"
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
                                            className="w-14 h-10 border border-gray-300 rounded text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                        />

                                        <button
                                            onClick={() => onUpdateStep(step.id, 'durationMinutes', step.durationMinutes + 1)}
                                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 w-10 h-10 rounded shadow-sm flex items-center justify-center font-bold text-lg active:translate-y-0.5 transition-all"
                                        >
                                            +
                                        </button>

                                        <button
                                            onClick={() => onUpdateStep(step.id, 'durationMinutes', step.durationMinutes + 5)}
                                            className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 w-10 h-10 rounded shadow-sm ml-1 flex items-center justify-center font-bold text-sm active:translate-y-0.5 transition-all"
                                        >
                                            +5
                                        </button>
                                    </div>
                                </div>

                                <div className="h-10 flex items-center">
                                    <button
                                        onClick={() => onRemoveStep(step.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors w-10 h-full flex items-center justify-center"
                                        title="削除"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onAddStep}
                className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors font-bold"
            >
                + ステップを追加
            </button>
        </div>
    );
};
