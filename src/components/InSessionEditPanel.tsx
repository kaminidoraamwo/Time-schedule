import React, { useState } from 'react';
import type { Step } from '../types';

export type FutureStep = { step: Step; index: number };

type Props = {
    futureSteps: FutureStep[];
    onInsert: (draft: { name: string; durationMinutes: number }) => void;
    onSkip: (index: number) => void;
    onClose: () => void;
};

const QUICK_DURATIONS = [5, 10, 15, 20, 30];

/**
 * 施術中の工程編集パネル（第3波 MVP）。
 * 「これからの工程」に対してのみ操作可能（現在/過去工程は編集ロック）。
 * - 直後に1工程を挿入
 * - これからの工程をスキップ
 */
export const InSessionEditPanel: React.FC<Props> = ({ futureSteps, onInsert, onSkip, onClose }) => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState(10);

    const canInsert = name.trim().length > 0 && duration >= 1;

    const handleInsert = () => {
        if (!canInsert) return;
        onInsert({ name: name.trim(), durationMinutes: duration });
    };

    return (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-cream border border-line rounded-none w-full max-w-md max-h-[85vh] flex flex-col">
                <div className="p-5 border-b border-line flex justify-between items-center">
                    <div>
                        <h2 className="font-serif text-xl text-ink">工程を編集</h2>
                        <p className="text-xs text-ink-soft mt-0.5">これからの工程のみ変更できます（タイマーは一時停止中）</p>
                    </div>
                    <button onClick={onClose} className="text-ink-faint hover:text-ink text-2xl transition-colors" aria-label="閉じる">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* 工程を挿入 */}
                    <div>
                        <h3 className="text-sm font-medium text-ink mb-2">現在の工程の直後に追加</h3>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="工程名（例: カット）"
                            className="w-full px-3 py-2 bg-cream border border-line rounded-none focus:outline-none focus:ring-1 focus:ring-ink mb-2"
                        />
                        <div className="flex flex-wrap gap-2 mb-2">
                            {QUICK_DURATIONS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`px-3 py-1.5 rounded-none border text-sm transition-colors ${
                                        duration === d
                                            ? 'bg-ink text-cream border-ink'
                                            : 'bg-cream border-line text-ink-soft hover:border-ink'
                                    }`}
                                >
                                    {d}分
                                </button>
                            ))}
                            <input
                                type="number"
                                min={1}
                                value={duration}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (!Number.isNaN(v)) setDuration(Math.max(1, v));
                                }}
                                className="w-16 px-2 py-1.5 bg-cream border border-line rounded-none text-center text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                            />
                        </div>
                        <button
                            onClick={handleInsert}
                            disabled={!canInsert}
                            className="w-full py-2.5 bg-forest text-cream rounded-none font-medium hover:opacity-90 disabled:bg-ink-faint disabled:opacity-100 disabled:cursor-not-allowed transition-opacity"
                        >
                            ＋ この工程を追加
                        </button>
                    </div>

                    {/* これからの工程（スキップ可能） */}
                    <div>
                        <h3 className="text-sm font-medium text-ink mb-2">これからの工程</h3>
                        {futureSteps.length === 0 ? (
                            <p className="text-sm text-ink-soft">これからの工程はありません</p>
                        ) : (
                            <ul className="space-y-2">
                                {futureSteps.map(({ step, index }) => (
                                    <li
                                        key={step.id}
                                        className="flex justify-between items-center bg-cream-alt border border-line rounded-none p-3"
                                    >
                                        <span className="text-sm text-ink">
                                            {step.name} <span className="text-ink-soft">({step.durationMinutes}分)</span>
                                        </span>
                                        <button
                                            onClick={() => onSkip(index)}
                                            className="text-sm border border-red-200 text-red-500 hover:bg-red-50 py-1 px-3 rounded-none transition-colors"
                                        >
                                            スキップ
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
