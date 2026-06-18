import React, { useState } from 'react';
import type { Preset } from '../../types';
import { getTotalDurationMinutes, formatTotalDurationLabel } from '../../utils/schedule';

type Props = {
    presets: Preset[];
    selectedId?: string | null;
    onSavePreset: (name: string) => void;
    onLoadPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
};

/** プリセットにアイコン未設定でもカードが寂しくならないよう既定の絵文字を使う。 */
const DEFAULT_PRESET_ICON = '📋';

export const PresetManager: React.FC<Props> = ({
    presets,
    selectedId,
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
            <h3 className="font-serif text-lg text-ink mb-3">マイプリセット</h3>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="現在の設定を保存..."
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

            {presets.length === 0 ? (
                <p className="text-sm text-ink-soft">
                    保存したプリセットはまだありません。よく使う設定を保存しておくと、ここからすぐ呼び出せます。
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {presets.map(preset => {
                        const totalMinutes = getTotalDurationMinutes(preset.steps);
                        const isSelected = preset.id === selectedId;
                        return (
                            <div key={preset.id} className="relative">
                                <button
                                    onClick={() => onLoadPreset(preset.id)}
                                    aria-pressed={isSelected}
                                    className={`flex flex-col items-center text-center w-full h-full bg-cream border rounded-none p-4 transition-colors active:translate-y-0.5 ${
                                        isSelected ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink'
                                    }`}
                                >
                                    {isSelected && (
                                        <span aria-hidden="true" className="absolute top-1 left-1 text-xs text-cream bg-ink px-1.5 py-0.5 rounded-none">選択中</span>
                                    )}
                                    <span className="text-3xl mb-2" aria-hidden="true">{preset.icon || DEFAULT_PRESET_ICON}</span>
                                    <span className="font-medium text-ink break-all">{preset.name}</span>
                                    <span className="text-xs text-ink-soft mt-1">{formatTotalDurationLabel(totalMinutes)}</span>
                                    <span className="text-xs text-ink-faint">{preset.steps.length}工程</span>
                                </button>
                                <button
                                    onClick={() => onDeletePreset(preset.id)}
                                    aria-label={`プリセット「${preset.name}」を削除`}
                                    className="absolute top-0 right-0 w-9 h-9 flex items-center justify-center text-lg text-ink-faint hover:text-red-500 hover:bg-red-50 rounded-none transition-colors"
                                >
                                    &times;
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
