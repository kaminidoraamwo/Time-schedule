import React from 'react';
import type { Step } from '../constants';
import type { Preset } from '../hooks/useSettings';
import { PresetManager } from './settings/PresetManager';
import { ScheduleEditor } from './settings/ScheduleEditor';
import { TotalDuration } from './settings/TotalDuration';


type Props = {
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
    onRequestNotificationPermission: () => void;
    permissionStatus: NotificationPermission;

    // New Props for Notification Integration
};

export const Settings: React.FC<Props> = ({
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
    onRequestNotificationPermission,
    permissionStatus,
}) => {
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
                        onLoadPreset={onLoadPreset}
                        onDeletePreset={onDeletePreset}
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
                    <div className="flex gap-4">
                        <button
                            onClick={onResetToDefault}
                            className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                        >
                            デフォルトに戻す
                        </button>
                        <button
                            onClick={onRequestNotificationPermission}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-1"
                        >
                            {permissionStatus === 'granted' ? '✅ 通知許可済み' :
                                permissionStatus === 'denied' ? '🚫 通知拒否設定' :
                                    '🔔 通知を許可'}
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg shadow"
                    >
                        完了
                    </button>
                </div>
            </div>
        </div>
    );
};
