import React, { useEffect, useRef } from 'react';
import type { StepRecord, Step, FinishReason, TimerMode } from '../types';
import { formatTimeJapanese, formatDateJapanese } from '../utils/time';

type Props = {
    steps: Step[];
    completedSteps: StepRecord[];
    onReset: () => void;
    finishReason: FinishReason;
    startTime: number | null;
    mode?: TimerMode;
    onSaveHistory: (completedSteps: StepRecord[], steps: Step[], startTime: number | null) => void;
};

export const SummaryView: React.FC<Props> = ({
    steps,
    completedSteps,
    onReset,
    finishReason,
    startTime,
    mode,
    onSaveHistory,
}) => {
    const hasSaved = useRef(false);

    // 正常終了時のみ履歴を保存（1回だけ）
    useEffect(() => {
        if (!hasSaved.current && finishReason === 'completed') {
            onSaveHistory(completedSteps, steps, startTime);
            hasSaved.current = true;
        }
    }, [finishReason, completedSteps, steps, startTime, onSaveHistory]);

    const totalPlanned = completedSteps.reduce((acc, s) => acc + s.plannedDuration, 0);
    const totalActual = completedSteps.reduce((acc, s) => acc + s.actualDuration, 0);
    const totalDiff = totalActual - totalPlanned;
    const isLate = totalDiff > 0;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-cream border border-line rounded-none">
            {/* 完了時刻 */}
            <h2 className="font-serif text-xl mb-4 text-center text-ink">{formatDateJapanese(new Date())}</h2>

            {mode === 'practice' && (
                <div className="mb-4 flex justify-center">
                    <span className="px-3 py-1 bg-forest/10 border border-forest/40 text-forest text-sm rounded-none">
                        練習モード — 予定どおり進められたか確認しましょう
                    </span>
                </div>
            )}

            {finishReason === 'skipped' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-none text-center text-yellow-700 text-sm">
                    ⚠️ 強制終了のため、履歴には保存されません
                </div>
            )}

            {/* サマリーセクション */}
            <div className="p-4 bg-cream-alt border border-line rounded-none mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-sm text-ink-soft">予定</div>
                        <div className="text-lg font-bold text-ink">{formatTimeJapanese(totalPlanned)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-ink-soft">実績</div>
                        <div className="text-lg font-bold text-ink">{formatTimeJapanese(totalActual)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-ink-soft">差分</div>
                        <div className={`text-lg font-bold ${isLate ? 'text-red-500' : 'text-green-600'}`}>
                            {isLate ? '+' : ''}{formatTimeJapanese(totalDiff)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 工程一覧 */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-line text-sm text-ink-soft">
                            <th className="py-2 pl-2">No.</th>
                            <th className="py-2">工程名</th>
                            <th className="py-2 text-right">予定</th>
                            <th className="py-2 text-right">実績</th>
                            <th className="py-2 text-right pr-2">差分</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedSteps.map((record, index) => {
                            const stepName = record.stepName ?? steps.find(s => s.id === record.stepId)?.name ?? `Step ${record.stepId}`;
                            const diff = record.actualDuration - record.plannedDuration;
                            const stepIsLate = diff > 0;

                            return (
                                <tr key={index} className="border-b border-line/50 hover:bg-cream-alt">
                                    <td className="py-3 pl-2 text-ink-soft">{index + 1}</td>
                                    <td className="py-3 text-sm font-medium text-ink">{stepName}</td>
                                    <td className="py-3 text-right text-sm text-ink-soft">{formatTimeJapanese(record.plannedDuration)}</td>
                                    <td className="py-3 text-right text-sm font-mono text-ink">{formatTimeJapanese(record.actualDuration)}</td>
                                    <td className={`py-3 text-right text-sm font-medium pr-2 ${stepIsLate ? 'text-red-500' : 'text-green-600'}`}>
                                        {stepIsLate ? '+' : ''}{formatTimeJapanese(diff)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onReset}
                    className="bg-ink hover:opacity-90 text-cream font-medium py-3 px-8 rounded-none transition-opacity"
                >
                    新しいセッションを開始
                </button>
            </div>
        </div>
    );
};
