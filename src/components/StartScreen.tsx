import React from 'react';

type Props = {
    stepsCount: number;
    totalDurationMinutes: number;
    canStart?: boolean;
    onStart: () => void;
    onOpenHistory: () => void;
};

export const StartScreen: React.FC<Props> = ({
    stepsCount,
    totalDurationMinutes,
    canStart = true,
    onStart,
    onOpenHistory,
}) => {
    const isStartDisabled = stepsCount === 0 || !canStart;
    return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="font-serif text-4xl mb-8 text-ink">準備はいいですか？</h2>
            <div className="text-ink-soft mb-12 text-center">
                合計時間: {Math.floor(totalDurationMinutes / 60)}時間 {totalDurationMinutes % 60}分<br />
                {stepsCount} 工程
            </div>
            <button
                onClick={onStart}
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
