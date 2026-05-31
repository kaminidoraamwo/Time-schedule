import React, { useState } from 'react';
import type { Preset } from '../../types';

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
        <div className="mb-8 bg-cream-alt p-4 rounded-none border border-line">
            <h3 className="font-serif text-lg text-ink mb-3">プリセット</h3>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="新しいプリセット名..."
                    className="flex-1 px-3 py-2 bg-cream border border-line rounded-none focus:outline-none focus:ring-1 focus:ring-ink"
                />
                <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="bg-ink hover:opacity-90 disabled:bg-ink-faint disabled:opacity-100 text-cream font-medium py-2 px-4 rounded-none transition-opacity"
                >
                    保存
                </button>
            </div>

            {presets.length > 0 && (
                <div className="space-y-2">
                    {presets.map(preset => (
                        <div key={preset.id} className="flex justify-between items-center bg-cream p-2 rounded-none border border-line">
                            <span className="font-medium text-ink">{preset.name}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onLoadPreset(preset.id)}
                                    className="text-sm border border-forest/50 hover:bg-forest/5 text-forest py-1 px-3 rounded-none transition-colors"
                                >
                                    読込
                                </button>
                                <button
                                    onClick={() => onDeletePreset(preset.id)}
                                    className="text-sm border border-red-200 hover:bg-red-50 text-red-500 py-1 px-3 rounded-none transition-colors"
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
