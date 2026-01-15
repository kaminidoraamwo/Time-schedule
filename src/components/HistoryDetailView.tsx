import React from 'react';
import type { SessionRecord } from '../types';
import { formatTimeJapanese, formatDateJapanese } from '../utils/time';

type Props = {
    record: SessionRecord;
    onBack: () => void;
};

export const HistoryDetailView: React.FC<Props> = ({ record, onBack }) => {
    const totalDiff = record.totalActualSeconds - record.totalPlannedSeconds;
    const isLate = totalDiff > 0;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* ヘッダー */}
                <div className="p-4 border-b flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← 戻る
                    </button>
                    <h2 className="text-lg font-bold">{formatDateJapanese(record.date)}</h2>
                </div>

                {/* サマリー */}
                <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-sm text-gray-500">予定</div>
                            <div className="text-lg font-bold">{formatTimeJapanese(record.totalPlannedSeconds)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">実績</div>
                            <div className="text-lg font-bold">{formatTimeJapanese(record.totalActualSeconds)}</div>
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
                <div className="flex-1 overflow-y-auto p-4">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-sm text-gray-500">
                                <th className="text-left py-2 pl-2">No.</th>
                                <th className="text-left py-2">工程名</th>
                                <th className="text-right py-2">予定</th>
                                <th className="text-right py-2">実績</th>
                                <th className="text-right py-2 pr-2">差分</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.steps.map((step, index) => {
                                const diff = step.actualDuration - step.plannedDuration;
                                const stepIsLate = diff > 0;
                                return (
                                    <tr key={index} className="border-b">
                                        <td className="py-3 pl-2 text-gray-500">{index + 1}</td>
                                        <td className="py-3">{step.stepName}</td>
                                        <td className="py-3 text-right">{formatTimeJapanese(step.plannedDuration)}</td>
                                        <td className="py-3 text-right">{formatTimeJapanese(step.actualDuration)}</td>
                                        <td className={`py-3 text-right pr-2 font-medium ${stepIsLate ? 'text-red-500' : 'text-green-500'}`}>
                                            {stepIsLate ? '+' : ''}{formatTimeJapanese(diff)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* フッター */}
                <div className="p-4 border-t">
                    <button
                        onClick={onBack}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        戻る
                    </button>
                </div>
            </div>
        </div>
    );
};
