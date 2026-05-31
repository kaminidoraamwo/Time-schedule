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
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
            <div className="bg-cream border border-line rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* ヘッダー */}
                <div className="p-4 border-b border-line flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-accent hover:opacity-70 font-medium transition-opacity"
                    >
                        ← 戻る
                    </button>
                    <h2 className="font-serif text-lg text-ink">{formatDateJapanese(record.date)}</h2>
                </div>

                {/* サマリー */}
                <div className="p-4 bg-cream-alt border-b border-line">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-sm text-ink-soft">予定</div>
                            <div className="text-lg font-bold text-ink">{formatTimeJapanese(record.totalPlannedSeconds)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-ink-soft">実績</div>
                            <div className="text-lg font-bold text-ink">{formatTimeJapanese(record.totalActualSeconds)}</div>
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
                <div className="flex-1 overflow-y-auto p-4">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-line text-sm text-ink-soft">
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
                                    <tr key={index} className="border-b border-line/50">
                                        <td className="py-3 pl-2 text-ink-soft">{index + 1}</td>
                                        <td className="py-3 text-ink">{step.stepName}</td>
                                        <td className="py-3 text-right text-ink-soft">{formatTimeJapanese(step.plannedDuration)}</td>
                                        <td className="py-3 text-right font-mono text-ink">{formatTimeJapanese(step.actualDuration)}</td>
                                        <td className={`py-3 text-right pr-2 font-medium ${stepIsLate ? 'text-red-500' : 'text-green-600'}`}>
                                            {stepIsLate ? '+' : ''}{formatTimeJapanese(diff)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* フッター */}
                <div className="p-4 border-t border-line">
                    <button
                        onClick={onBack}
                        className="w-full bg-ink text-cream py-3 rounded-none font-medium hover:opacity-90 transition-opacity"
                    >
                        戻る
                    </button>
                </div>
            </div>
        </div>
    );
};
