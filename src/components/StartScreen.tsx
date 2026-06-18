import React, { useState } from 'react';
import type { TimerMode } from '../types';

type Props = {
    stepsCount: number;
    totalDurationMinutes: number;
    canStart?: boolean;
    menuName?: string;
    isMenuDirty?: boolean;
    onStart: (mode: TimerMode) => void;
    onBack?: () => void;
    onOpenHistory: () => void;
};

export const StartScreen: React.FC<Props> = ({
    stepsCount,
    totalDurationMinutes,
    canStart = true,
    menuName,
    isMenuDirty = false,
    onStart,
    onBack,
    onOpenHistory,
}) => {
    const [mode, setMode] = useState<TimerMode>('live');
    const isStartDisabled = stepsCount === 0 || !canStart;
    return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            {onBack && (
                <button
                    onClick={onBack}
                    className="self-start mb-4 text-sm text-ink-soft hover:text-ink transition-colors"
                >
                    ← メニューを選び直す
                </button>
            )}

            {menuName ? (
                <div className="mb-8 text-center">
                    <p className="text-sm text-ink-soft mb-1">このメニューで始めます</p>
                    <h2 className="font-serif text-4xl text-ink">『{menuName}』</h2>
                    {isMenuDirty && (
                        <p className="text-xs text-accent mt-1">工程を編集しています（変更あり）</p>
                    )}
                </div>
            ) : (
                <h2 className="font-serif text-4xl mb-8 text-ink">準備はいいですか？</h2>
            )}
            <div className="text-ink-soft mb-8 text-center">
                合計時間: {Math.floor(totalDurationMinutes / 60)}時間 {totalDurationMinutes % 60}分<br />
                {stepsCount} 工程
            </div>

            {/* モード選択（本番=自由編集 / 練習=予定ロック） */}
            <div className="flex gap-2 mb-8" role="group" aria-label="モード選択">
                {([
                    { value: 'live', label: '本番', hint: '施術中に工程を編集できます' },
                    { value: 'practice', label: '練習', hint: '予定どおりに進める練習・採点' },
                ] as const).map((m) => (
                    <button
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        aria-pressed={mode === m.value}
                        title={m.hint}
                        className={`px-6 py-2 rounded-none border text-sm transition-colors ${
                            mode === m.value
                                ? 'bg-ink text-cream border-ink'
                                : 'bg-cream border-line text-ink-soft hover:border-ink'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onStart(mode)}
                disabled={isStartDisabled}
                className="bg-ink hover:opacity-90 disabled:bg-ink-faint disabled:opacity-100 disabled:cursor-not-allowed text-cream text-3xl font-medium py-8 px-20 rounded-none transition-opacity active:opacity-80"
            >
                スタート
            </button>

            {isStartDisabled && (
                <p className="mt-4 text-sm text-red-500 text-center">
                    {stepsCount === 0
                        ? '工程を1つ以上設定してください'
                        : '時間が未設定の工程があります（設定で1分以上に）'}
                </p>
            )}

            {/* 履歴ボタン（スタート画面のみ） */}
            <button
                onClick={onOpenHistory}
                className="mt-10 text-sm text-ink-soft hover:text-accent transition-colors underline underline-offset-4 decoration-line"
            >
                施術履歴を見る
            </button>
        </div>
    );
};
