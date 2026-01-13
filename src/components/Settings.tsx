import React, { useState } from 'react';
import type { Step } from '../constants';
import type { Preset } from '../hooks/useSettings';
import { PresetManager } from './settings/PresetManager';
import { ScheduleEditor } from './settings/ScheduleEditor';
import { TotalDuration } from './settings/TotalDuration';


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
}) => {
    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        type: 'RESET' | 'LOAD' | 'DELETE';
        presetId?: string;
        presetName?: string;
    } | null>(null);

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

    const executeAction = () => {
        if (!confirmState) return;

        if (confirmState.type === 'RESET') {
            onResetToDefault();
        } else if (confirmState.type === 'LOAD' && confirmState.presetId) {
            onLoadPreset(confirmState.presetId);
        } else if (confirmState.type === 'DELETE' && confirmState.presetId) {
            onDeletePreset(confirmState.presetId);
        }
        setConfirmState(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">設定</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <PresetManager
                        presets={presets}
                        onSavePreset={onSavePreset}
                        onLoadPreset={handleLoadRequest}
                        onDeletePreset={handleDeleteRequest}
                    />

                    <TotalDuration steps={steps} />

                    <ScheduleEditor
                        steps={steps}
                        onUpdateStep={onUpdateStep}
                        onAddStep={onAddStep}
                        onRemoveStep={onRemoveStep}
                        onMoveStep={onMoveStep}
                    />

                    <TotalDuration
                        steps={steps}
                        className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200"
                    />
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center">
                    <button
                        onClick={handleResetRequest}
                        className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                    >
                        デフォルトに戻す
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg shadow"
                    >
                        完了
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmState && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">確認</h3>
                        <p className="text-gray-600 mb-6 whitespace-pre-line">
                            {confirmState.type === 'RESET' && '設定を初期状態に戻しますか？'}
                            {confirmState.type === 'LOAD' && `プリセット「${confirmState.presetName}」を読み込みますか？\n現在の設定は上書きされます。`}
                            {confirmState.type === 'DELETE' && 'このプリセットを削除しますか？'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmState(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={executeAction}
                                className={`px-4 py-2 text-white rounded-lg transition-colors shadow-sm ${confirmState.type === 'LOAD' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {confirmState.type === 'LOAD' ? '読み込む' : '実行する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
