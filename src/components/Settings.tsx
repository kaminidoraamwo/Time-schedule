import React, { useState } from 'react';
import type { Step } from '../types';
import type { Preset } from '../types';
import { TEMPLATES } from '../constants';
import { validateSchedule } from '../utils/schedule';
import { PresetManager } from './settings/PresetManager';
import { ScheduleEditor } from './settings/ScheduleEditor';
import { TotalDuration } from './settings/TotalDuration';
import { TemplateGallery } from './settings/TemplateGallery';


type SettingsProps = {
    steps: Step[];
    presets: Preset[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateStep: (id: number, field: keyof Step, value: string | number) => void;
    onAddStep: () => void;
    onRemoveStep: (id: number) => void;
    onMoveStep: (index: number, direction: 'up' | 'down') => void;
    onResetToDefault: () => void;
    onSavePreset: (name: string) => void;
    onLoadPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
    onApplyTemplate: (id: string) => void;
};

export const Settings: React.FC<SettingsProps> = ({
    steps,
    presets,
    isOpen,
    onClose,
    onUpdateStep,
    onAddStep,
    onRemoveStep,
    onMoveStep,
    onResetToDefault,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
    onApplyTemplate,
}) => {
    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        type: 'RESET' | 'LOAD' | 'DELETE' | 'TEMPLATE';
        presetId?: string;
        presetName?: string;
        templateId?: string;
        templateName?: string;
    } | null>(null);

    const validation = validateSchedule(steps);

    // Handlers to trigger confirmation
    const handleResetRequest = () => {
        setConfirmState({ type: 'RESET' });
    };

    const handleLoadRequest = (id: string) => {
        const preset = presets.find(p => p.id === id);
        if (preset) {
            setConfirmState({ type: 'LOAD', presetId: id, presetName: preset.name });
        }
    };

    const handleDeleteRequest = (id: string) => {
        const preset = presets.find(p => p.id === id);
        if (preset) {
            setConfirmState({ type: 'DELETE', presetId: id, presetName: preset.name });
        }
    };

    const handleTemplateRequest = (id: string) => {
        const template = TEMPLATES.find(t => t.id === id);
        if (template) {
            setConfirmState({ type: 'TEMPLATE', templateId: id, templateName: template.name });
        }
    };

    const executeAction = () => {
        if (!confirmState) return;

        if (confirmState.type === 'RESET') {
            onResetToDefault();
        } else if (confirmState.type === 'LOAD' && confirmState.presetId) {
            onLoadPreset(confirmState.presetId);
        } else if (confirmState.type === 'DELETE' && confirmState.presetId) {
            onDeletePreset(confirmState.presetId);
        } else if (confirmState.type === 'TEMPLATE' && confirmState.templateId) {
            onApplyTemplate(confirmState.templateId);
        }
        setConfirmState(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
            <div className="bg-cream border border-line rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-line flex justify-between items-center">
                    <h2 className="font-serif text-2xl text-ink">設定</h2>
                    <button onClick={onClose} className="text-ink-faint hover:text-ink text-2xl transition-colors">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* 合計時間・終了予定・妥当性を常時固定ヘッダで表示（重複描画を解消） */}
                    <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-cream border-b border-line">
                        <TotalDuration steps={steps} className="p-4 bg-cream-alt rounded-none border border-line" />
                    </div>

                    <div className="mt-6">
                        <TemplateGallery templates={TEMPLATES} onSelectTemplate={handleTemplateRequest} />
                    </div>

                    <PresetManager
                        presets={presets}
                        onSavePreset={onSavePreset}
                        onLoadPreset={handleLoadRequest}
                        onDeletePreset={handleDeleteRequest}
                    />

                    <ScheduleEditor
                        steps={steps}
                        invalidStepIds={validation.invalidStepIds}
                        onUpdateStep={onUpdateStep}
                        onAddStep={onAddStep}
                        onRemoveStep={onRemoveStep}
                        onMoveStep={onMoveStep}
                    />
                </div>

                <div className="p-6 border-t border-line bg-cream-alt flex justify-between items-center">
                    <button
                        onClick={handleResetRequest}
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
            {confirmState && (
                <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-cream border border-line rounded-none p-6 max-w-sm w-full mx-4">
                        <h3 className="font-serif text-lg text-ink mb-2">確認</h3>
                        <p className="text-ink-soft mb-6 whitespace-pre-line">
                            {confirmState.type === 'RESET' && '設定を初期状態に戻しますか？'}
                            {confirmState.type === 'LOAD' && `プリセット「${confirmState.presetName}」を読み込みますか？\n現在の設定は上書きされます。`}
                            {confirmState.type === 'DELETE' && 'このプリセットを削除しますか？'}
                            {confirmState.type === 'TEMPLATE' && `テンプレート「${confirmState.templateName}」を読み込みますか？\n現在の設定は上書きされます。`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmState(null)}
                                className="px-4 py-2 text-ink-soft hover:bg-cream-alt rounded-none transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={executeAction}
                                className={`px-4 py-2 text-cream rounded-none transition-opacity hover:opacity-90 ${confirmState.type === 'LOAD' || confirmState.type === 'TEMPLATE' ? 'bg-forest' : 'bg-red-500'
                                    }`}
                            >
                                {confirmState.type === 'LOAD' || confirmState.type === 'TEMPLATE' ? '読み込む' : '実行する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
