import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Step } from '../../types';
import { QUICK_DURATIONS } from '../../constants';

type Props = {
    step: Step;
    index: number;
    stepsLength: number;
    isInvalid: boolean;
    onUpdateStep: (id: number, field: keyof Step, value: string | number) => void;
    onRemoveStep: (id: number) => void;
    onMoveStep: (index: number, direction: 'up' | 'down') => void;
    onDuplicateStep?: (id: number) => void;
};

/**
 * D&D で並べ替え可能な工程編集行。
 * ドラッグハンドル（⠿）で並べ替え、▲▼ はアクセシビリティ用フォールバックとして残す。
 */
export const SortableStepRow: React.FC<Props> = ({
    step,
    index,
    stepsLength,
    isInvalid,
    onUpdateStep,
    onRemoveStep,
    onMoveStep,
    onDuplicateStep,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-cream-alt p-4 rounded-none border ${isInvalid ? 'border-red-400' : 'border-line'}`}
        >
            <div className="flex flex-col gap-3">
                {/* Row 1: ハンドル / ▲▼ / 工程名 */}
                <div className="flex items-center gap-2 w-full">
                    <button
                        {...attributes}
                        {...listeners}
                        className="text-ink-faint hover:text-ink cursor-grab active:cursor-grabbing touch-none p-1 text-lg leading-none"
                        title="ドラッグで並べ替え"
                        aria-label="ドラッグで並べ替え"
                    >
                        ⠿
                    </button>
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => onMoveStep(index, 'up')}
                            disabled={index === 0}
                            className="text-ink-faint hover:text-ink disabled:opacity-30 px-1 text-xs transition-colors"
                            aria-label="上へ"
                        >
                            ▲
                        </button>
                        <button
                            onClick={() => onMoveStep(index, 'down')}
                            disabled={index === stepsLength - 1}
                            className="text-ink-faint hover:text-ink disabled:opacity-30 px-1 text-xs transition-colors"
                            aria-label="下へ"
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

                {/* Row 2a: 時間チップ（ワンタップ） */}
                <div className="pl-8">
                    <label className="block text-xs text-ink-soft mb-1">時間設定 (分)</label>
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {QUICK_DURATIONS.map((d) => (
                            <button
                                key={d}
                                onClick={() => onUpdateStep(step.id, 'durationMinutes', d)}
                                className={`py-1 rounded-none border text-sm text-center transition-colors ${
                                    step.durationMinutes === d
                                        ? 'bg-ink text-cream border-ink'
                                        : 'bg-cream border-line text-ink-soft hover:border-ink'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 2b: 微調整と複製・削除 */}
                <div className="flex items-end gap-4 pl-8">
                    <div>
                        <label className="block text-xs text-ink-soft mb-1">微調整</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onUpdateStep(step.id, 'durationMinutes', Math.max(1, step.durationMinutes - 1))}
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
                        </div>
                    </div>

                    <div className="h-10 flex items-center gap-1">
                        {onDuplicateStep && (
                            <button
                                onClick={() => onDuplicateStep(step.id)}
                                className="text-ink-soft hover:text-ink hover:bg-cream p-2 rounded-none transition-colors w-10 h-full flex items-center justify-center"
                                title="複製"
                            >
                                ⧉
                            </button>
                        )}
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
                    <p className="text-sm text-red-500 pl-8">時間を1分以上に設定してください</p>
                )}
            </div>
        </div>
    );
};
