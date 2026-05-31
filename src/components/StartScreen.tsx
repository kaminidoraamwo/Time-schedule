import React from 'react';

type Props = {
    stepsCount: number;
    totalDurationMinutes: number;
    onStart: () => void;
    onOpenHistory: () => void;
};

export const StartScreen: React.FC<Props> = ({
    stepsCount,
    totalDurationMinutes,
    onStart,
    onOpenHistory,
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="font-serif text-4xl mb-8 text-ink">準備はいいですか？</h2>
            <div className="text-ink-soft mb-12 text-center">
                合計時間: {Math.floor(totalDurationMinutes / 60)}時間 {totalDurationMinutes % 60}分<br />
                {stepsCount} 工程
            </div>
            <button
                onClick={onStart}
                disabled={stepsCount === 0}
                className="bg-ink hover:opacity-90 disabled:bg-ink-faint disabled:opacity-100 disabled:cursor-not-allowed text-cream text-3xl font-medium py-8 px-20 rounded-none transition-opacity active:opacity-80"
            >
                スタート
            </button>

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
