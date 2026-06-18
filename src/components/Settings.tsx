import React, { useState } from 'react';
import type { Step } from '../types';
import { validateSchedule } from '../utils/schedule';
import { ScheduleEditor } from './settings/ScheduleEditor';
import { TotalDuration } from './settings/TotalDuration';


type SettingsProps = {
    steps: Step[];
    isOpen: boolean;
    menuName?: string;
    isMenuDirty?: boolean;
    onClose: () => void;
    onUpdateStep: (id: number, field: keyof Step, value: string | number) => void;
    onAddStep: () => void;
    onRemoveStep: (id: number) => void;
    onMoveStep: (index: number, direction: 'up' | 'down') => void;
    onResetToDefault: () => void;
    onDuplicateStep: (id: number) => void;
    onAddNamedStep: (name: string) => void;
    onReorderStep: (from: number, to: number) => void;
};

export const Settings: React.FC<SettingsProps> = ({
    steps,
    isOpen,
    menuName,
    isMenuDirty = false,
    onClose,
    onUpdateStep,
    onAddStep,
    onRemoveStep,
    onMoveStep,
    onResetToDefault,
    onDuplicateStep,
    onAddNamedStep,
    onReorderStep,
}) => {
    // 「デフォルトに戻す」だけ確認をはさむ（破壊的なため）。
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const validation = validateSchedule(steps);

    const executeReset = () => {
        onResetToDefault();
        setIsResetConfirmOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
            <div className="bg-cream border border-line rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-line flex justify-between items-start">
                    <div>
                        <h2 className="font-serif text-2xl text-ink">設定</h2>
                        {menuName && (
                            <p className="text-sm text-ink-soft mt-1">
                                『{menuName}』の工程を編集
                                {isMenuDirty && <span className="text-accent">（変更あり）</span>}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-ink-faint hover:text-ink text-2xl transition-colors leading-none">&times;</button>
                </div>

                {/* 合計時間・終了予定・妥当性は常駐バンド（スクロールに巻き込まれないので隙間が出ない） */}
                <div className="px-6 py-4 border-b border-line bg-cream">
                    <TotalDuration steps={steps} className="p-4 bg-cream-alt rounded-none border border-line" />
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <ScheduleEditor
                        steps={steps}
                        invalidStepIds={validation.invalidStepIds}
                        onUpdateStep={onUpdateStep}
                        onAddStep={onAddStep}
                        onRemoveStep={onRemoveStep}
                        onMoveStep={onMoveStep}
                        onDuplicateStep={onDuplicateStep}
                        onAddNamedStep={onAddNamedStep}
                        onReorderStep={onReorderStep}
                    />
                </div>

                <div className="p-6 border-t border-line bg-cream-alt flex justify-between items-center">
                    <button
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium underline underline-offset-2 transition-colors"
                    >
                        デフォルトに戻す
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-ink hover:opacity-90 text-cream font-medium py-2 px-8 rounded-none transition-opacity"
                    >
                        完了
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isResetConfirmOpen && (
                <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-cream border border-line rounded-none p-6 max-w-sm w-full mx-4">
                        <h3 className="font-serif text-lg text-ink mb-2">確認</h3>
                        <p className="text-ink-soft mb-6">設定を初期状態に戻しますか？</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsResetConfirmOpen(false)}
                                className="px-4 py-2 text-ink-soft hover:bg-cream-alt rounded-none transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={executeReset}
                                className="px-4 py-2 text-cream bg-red-500 rounded-none transition-opacity hover:opacity-90"
                            >
                                実行する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
