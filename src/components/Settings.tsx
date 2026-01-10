import React, { useState } from 'react';
import type { Step } from '../constants';
import type { Preset } from '../hooks/useSettings';

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
    // onRequestNotificationPermission removed from props interface as we handle it inside with feedback, 
    // but keeping it if passed from parent or we can use the logic directly here.
    // Actually, let's keep the prop but enhance the UI using local state for display.
    onRequestNotificationPermission: () => void;
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
}) => {
    const [newPresetName, setNewPresetName] = useState('');
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const handleRequestPermission = () => {
        if (permissionStatus === 'granted') {
            alert('通知は既に許可されています。');
            return;
        }
        if (permissionStatus === 'denied') {
            alert('通知がブロックされています。ブラウザの設定から許可してください。');
            return;
        }
        onRequestNotificationPermission();
        // Check again after a short delay
        setTimeout(() => {
            setPermissionStatus(Notification.permission);
        }, 1000);
    };

    if (!isOpen) return null;

    const handleSavePreset = () => {
        if (!newPresetName.trim()) return;
        onSavePreset(newPresetName);
        setNewPresetName('');
    };

    const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMinutes = totalDurationMinutes % 60;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">設定</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Presets Section */}
                    <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-800 mb-3">プリセット</h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="新しいプリセット名..."
                                className="flex-1 px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSavePreset}
                                disabled={!newPresetName.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded shadow"
                            >
                                保存
                            </button>
                        </div>

                        {presets.length > 0 && (
                            <div className="space-y-2">
                                {presets.map(preset => (
                                    <div key={preset.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                                        <span className="font-medium text-gray-700">{preset.name}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onLoadPreset(preset.id)}
                                                className="text-sm bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded"
                                            >
                                                読込
                                            </button>
                                            <button
                                                onClick={() => onDeletePreset(preset.id)}
                                                className="text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total Duration Display */}
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">合計時間</span>
                            <span className="text-2xl font-bold text-gray-800">
                                {totalHours}時間 {totalMinutes}分
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {steps.length} 工程
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-3">スケジュール編集</h3>
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => onMoveStep(index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => onMoveStep(index, 'down')}
                                        disabled={index === steps.length - 1}
                                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30"
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

                                <div className="w-24">
                                    <label className="block text-xs text-gray-500 mb-1">分</label>
                                    <input
                                        type="number"
                                        value={step.durationMinutes}
                                        onChange={(e) => onUpdateStep(step.id, 'durationMinutes', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={() => onRemoveStep(step.id)}
                                    className="text-red-400 hover:text-red-600 p-2"
                                    title="Remove Step"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onAddStep}
                        className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors font-bold"
                    >
                        + ステップを追加
                    </button>

                    {/* Total Duration Display (Bottom) */}
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">合計時間</span>
                            <span className="text-2xl font-bold text-gray-800">
                                {totalHours}時間 {totalMinutes}分
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {steps.length} 工程
                        </div>
                    </div>
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
                            onClick={handleRequestPermission}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-1"
                        >
                            {permissionStatus === 'granted' ? '✅ 通知許可済み' :
                                permissionStatus === 'denied' ? '🚫 通知拒否設定' :
                                    '🔔 通知を許可'}
                        </button>
                    </div>
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
