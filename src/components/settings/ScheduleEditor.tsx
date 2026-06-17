import React from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Step } from '../../types';
import { STEP_PRESET_NAMES } from '../../constants';
import { SortableStepRow } from './SortableStepRow';

type Props = {
    steps: Step[];
    invalidStepIds?: number[];
    onUpdateStep: (id: number, field: keyof Step, value: string | number) => void;
    onAddStep: () => void;
    onRemoveStep: (id: number) => void;
    onMoveStep: (index: number, direction: 'up' | 'down') => void;
    onDuplicateStep?: (id: number) => void;
    onAddNamedStep?: (name: string) => void;
    onReorderStep?: (from: number, to: number) => void;
};

export const ScheduleEditor: React.FC<Props> = ({
    steps,
    invalidStepIds = [],
    onUpdateStep,
    onAddStep,
    onRemoveStep,
    onMoveStep,
    onDuplicateStep,
    onAddNamedStep,
    onReorderStep
}) => {
    const sensors = useSensors(
        // ポインタは8px動かしてからドラッグ開始（入力中の誤発火を防ぐ）
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !onReorderStep) return;
        const from = steps.findIndex((s) => s.id === active.id);
        const to = steps.findIndex((s) => s.id === over.id);
        if (from === -1 || to === -1) return;
        onReorderStep(from, to);
    };

    return (
        <div>
            <h3 className="font-serif text-lg text-ink mb-3">スケジュール編集</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <SortableStepRow
                                key={step.id}
                                step={step}
                                index={index}
                                stepsLength={steps.length}
                                isInvalid={invalidStepIds.includes(step.id)}
                                onUpdateStep={onUpdateStep}
                                onRemoveStep={onRemoveStep}
                                onMoveStep={onMoveStep}
                                onDuplicateStep={onDuplicateStep}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={onAddStep}
                className="mt-6 w-full py-3 border border-dashed border-line text-ink-soft rounded-none hover:border-ink hover:text-ink transition-colors font-medium"
            >
                + ステップを追加
            </button>

            {onAddNamedStep && (
                <div className="mt-4">
                    <p className="text-xs text-ink-soft mb-2">よく使う工程から追加</p>
                    <div className="flex flex-wrap gap-2">
                        {STEP_PRESET_NAMES.map((name) => (
                            <button
                                key={name}
                                onClick={() => onAddNamedStep(name)}
                                className="px-3 py-1.5 rounded-none border border-line text-sm text-ink-soft bg-cream hover:border-ink hover:text-ink transition-colors"
                            >
                                ＋ {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
