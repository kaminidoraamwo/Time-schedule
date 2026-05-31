import React, { useState } from 'react';
import type { SessionRecord } from '../types';
import { HistoryDetailView } from './HistoryDetailView';
import { formatDurationJapanese, formatDateJapanese } from '../utils/time';

type Props = {
    history: SessionRecord[];
    onDelete: (id: string) => void;
    onClearAll: () => void;
    onClose: () => void;
};

export const HistoryView: React.FC<Props> = ({
    history,
    onDelete,
    onClearAll,
    onClose,
}) => {
    // 詳細表示する記録
    const [selectedRecord, setSelectedRecord] = useState<SessionRecord | null>(null);
    // 全件削除の確認ダイアログ
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    // 削除確認ダイアログ
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // 詳細画面を表示中なら詳細を描画
    if (selectedRecord) {
        return (
            <HistoryDetailView
                record={selectedRecord}
                onBack={() => setSelectedRecord(null)}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
            <div className="bg-cream border border-line rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* ヘッダー */}
                <div className="p-4 border-b border-line flex justify-between items-center">
                    <h2 className="font-serif text-xl text-ink">施術履歴</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-ink-faint hover:text-ink transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* 一覧 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-ink-faint">
                            <div className="text-4xl mb-4">📭</div>
                            <p>履歴がありません</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map(record => {
                                const diff = record.totalActualSeconds - record.totalPlannedSeconds;
                                const diffMinutes = Math.round(diff / 60);
                                const isLate = diff > 0;

                                return (
                                    <div key={record.id} className="border border-line rounded-none p-4 hover:bg-cream-alt transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-lg font-medium text-ink">
                                                {formatDateJapanese(record.date)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm text-ink-soft mb-3">
                                            <div>予定: {formatDurationJapanese(record.totalPlannedSeconds)}</div>
                                            <div>実績: {formatDurationJapanese(record.totalActualSeconds)}</div>
                                            <div className={`font-bold ${isLate ? 'text-red-500' : 'text-green-600'}`}>
                                                差分: {isLate ? '+' : ''}{diffMinutes}分 {isLate ? '⚠️' : '👍'}
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedRecord(record)}
                                                className="text-accent hover:opacity-70 text-sm font-medium transition-opacity"
                                            >
                                                詳細
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(record.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div className="p-4 border-t border-line flex justify-between items-center">
                    {history.length > 0 ? (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                            全件削除
                        </button>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={onClose}
                        className="bg-ink text-cream px-6 py-2 rounded-none font-medium hover:opacity-90 transition-opacity"
                    >
                        閉じる
                    </button>
                </div>
            </div>

            {/* 個別削除確認ダイアログ */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-60">
                    <div className="bg-cream border border-line p-6 rounded-none max-w-sm w-full mx-4">
                        <h3 className="font-serif text-lg text-ink mb-2">確認</h3>
                        <p className="text-ink-soft mb-6">この履歴を削除しますか？</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-ink-soft hover:bg-cream-alt rounded-none transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(deleteConfirmId);
                                    setDeleteConfirmId(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-none hover:bg-red-600 transition-colors"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 全件削除確認ダイアログ */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-60">
                    <div className="bg-cream border border-line p-6 rounded-none max-w-sm w-full mx-4">
                        <h3 className="font-serif text-lg text-ink mb-2">確認</h3>
                        <p className="text-ink-soft mb-6">
                            すべての履歴を削除しますか？<br />
                            <span className="text-sm text-ink-faint">この操作は取り消せません</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-ink-soft hover:bg-cream-alt rounded-none transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    onClearAll();
                                    setShowClearConfirm(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-none hover:bg-red-600 transition-colors"
                            >
                                すべて削除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
