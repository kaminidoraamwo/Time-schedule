import React, { useEffect, useRef } from 'react';
import type { StepRecord, Step, FinishReason } from '../types';
import { formatTimeJapanese, formatDateJapanese } from '../utils/time';

type Props = {
    steps: Step[];
    completedSteps: StepRecord[];
    onReset: () => void;
    finishReason: FinishReason;
    startTime: number | null;
    onSaveHistory: (completedSteps: StepRecord[], steps: Step[], startTime: number | null) => void;
};

export const SummaryView: React.FC<Props> = ({
    steps,
    completedSteps,
    onReset,
    finishReason,
    startTime,
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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            {/* 完了時刻 */}
            <h2 className="text-lg font-bold mb-4 text-center">{formatDateJapanese(new Date())}</h2>

            {finishReason === 'skipped' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-700 text-sm">
                    ⚠️ 強制終了のため、履歴には保存されません
                </div>
            )}

            {/* サマリーセクション */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-sm text-gray-500">予定</div>
                        <div className="text-lg font-bold">{formatTimeJapanese(totalPlanned)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">実績</div>
                        <div className="text-lg font-bold">{formatTimeJapanese(totalActual)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">差分</div>
                        <div className={`text-lg font-bold ${isLate ? 'text-red-500' : 'text-green-500'}`}>
                            {isLate ? '+' : ''}{formatTimeJapanese(totalDiff)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 工程一覧 */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b text-sm text-gray-500">
                            <th className="py-2 pl-2">No.</th>
                            <th className="py-2">工程名</th>
                            <th className="py-2 text-right">予定</th>
                            <th className="py-2 text-right">実績</th>
                            <th className="py-2 text-right pr-2">差分</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedSteps.map((record, index) => {
                            const step = steps.find(s => s.id === record.stepId);
                            const diff = record.actualDuration - record.plannedDuration;
                            const stepIsLate = diff > 0;

                            return (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 pl-2 text-gray-500">{index + 1}</td>
                                    <td className="py-3 text-sm font-medium text-gray-700">{step?.name || `Step ${record.stepId}`}</td>
                                    <td className="py-3 text-right text-sm text-gray-500">{formatTimeJapanese(record.plannedDuration)}</td>
                                    <td className="py-3 text-right text-sm font-mono">{formatTimeJapanese(record.actualDuration)}</td>
                                    <td className={`py-3 text-right text-sm font-medium pr-2 ${stepIsLate ? 'text-red-500' : 'text-green-500'}`}>
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
                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors"
                >
                    新しいセッションを開始
                </button>
            </div>
        </div>
    );
};
