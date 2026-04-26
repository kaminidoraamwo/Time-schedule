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
            <h2 className="text-4xl font-bold mb-8 text-gray-800">準備はいいですか？</h2>
            <div className="text-gray-500 mb-12 text-center">
                合計時間: {Math.floor(totalDurationMinutes / 60)}時間 {totalDurationMinutes % 60}分<br />
                {stepsCount} 工程
            </div>
            <button
                onClick={onStart}
                disabled={stepsCount === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-3xl font-bold py-8 px-16 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100"
            >
                スタート
            </button>

            {/* 履歴ボタン（スタート画面のみ） */}
            <button
                onClick={onOpenHistory}
                className="mt-8 text-gray-500 hover:text-blue-600 transition-colors"
            >
                📜 履歴を見る
            </button>
        </div>
    );
};
