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
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Step } from '../../types';

type Props = {
    steps: Step[];
    onReorder: (from: number, to: number) => void;
    onClose: () => void;
};

// 工程名だけのコンパクトな並べ替え行（行全体がドラッグ可能で掴みやすい）
const CompactRow: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
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
            {...attributes}
            {...listeners}
            className="flex items-center gap-3 bg-cream-alt border border-line rounded-none px-3 py-3 cursor-grab active:cursor-grabbing touch-none select-none"
        >
            <span className="text-ink-faint text-lg leading-none" aria-hidden="true">⠿</span>
            <span className="flex-1 text-ink text-sm">
                <span className="text-ink-soft mr-1">{index + 1}.</span>
                {step.name}
            </span>
            <span className="text-ink-soft text-xs tabular-nums">{step.durationMinutes}分</span>
        </div>
    );
};

/**
 * 工程の並べ替え専用モーダル。
 * 大きな編集カードごと動かすより、工程名だけの短い行をドラッグする方が分かりやすい。
 * 既存のカード内D&D／▲▼とは別の入口（両方残す）。
 */
export const ReorderPanel: React.FC<Props> = ({ steps, onReorder, onClose }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const from = steps.findIndex((s) => s.id === active.id);
        const to = steps.findIndex((s) => s.id === over.id);
        if (from === -1 || to === -1) return;
        onReorder(from, to);
    };

    return (
        <div className="fixed inset-0 bg-ink/40 z-[55] flex items-end sm:items-center justify-center p-4">
            <div className="bg-cream border border-line rounded-none w-full max-w-md max-h-[85vh] flex flex-col">
                <div className="p-5 border-b border-line flex justify-between items-center">
                    <div>
                        <h2 className="font-serif text-xl text-ink">工程の並べ替え</h2>
                        <p className="text-xs text-ink-soft mt-0.5">行をドラッグして順番を入れ替え</p>
                    </div>
                    <button onClick={onClose} aria-label="閉じる" className="text-ink-faint hover:text-ink text-2xl transition-colors">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {steps.map((step, index) => (
                                    <CompactRow key={step.id} step={step} index={index} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="p-4 border-t border-line bg-cream-alt flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-ink hover:opacity-90 text-cream font-medium py-2 px-8 rounded-none transition-opacity"
                    >
                        完了
                    </button>
                </div>
            </div>
        </div>
    );
};
