import React, { useState } from 'react';
import type { Preset } from '../../hooks/useSettings';

type Props = {
    presets: Preset[];
    onSavePreset: (name: string) => void;
    onLoadPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
};

export const PresetManager: React.FC<Props> = ({
    presets,
    onSavePreset,
    onLoadPreset,
    onDeletePreset
}) => {
    const [newPresetName, setNewPresetName] = useState('');

    const handleSavePreset = () => {
        if (!newPresetName.trim()) return;
        onSavePreset(newPresetName);
        setNewPresetName('');
    };

    return (
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
    );
};
