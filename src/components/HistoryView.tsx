import React, { useState } from 'react';
import type { SessionRecord } from '../types';
import { HistoryDetailView } from './HistoryDetailView';

type Props = {
    history: SessionRecord[];
    onDelete: (id: string) => void;
    onClearAll: () => void;
    onClose: () => void;
};

// 秒を「○分」または「○時間○分」形式に変換
const formatDuration = (seconds: number): string => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}時間${mins}分`;
    }
    return `${totalMinutes}分`;
};

// ISO日時を日本語形式に変換
const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* ヘッダー */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📜 施術履歴</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>

                {/* 一覧 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
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
                                    <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-lg font-medium">
                                                📅 {formatDate(record.date)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                                            <div>予定: {formatDuration(record.totalPlannedSeconds)}</div>
                                            <div>実績: {formatDuration(record.totalActualSeconds)}</div>
                                            <div className={`font-bold ${isLate ? 'text-red-500' : 'text-green-500'}`}>
                                                差分: {isLate ? '+' : ''}{diffMinutes}分 {isLate ? '⚠️' : '👍'}
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedRecord(record)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                詳細
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(record.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
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
                <div className="p-4 border-t flex justify-between items-center">
                    {history.length > 0 ? (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            全件削除
                        </button>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        閉じる
                    </button>
                </div>
            </div>

            {/* 個別削除確認ダイアログ */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold mb-2">確認</h3>
                        <p className="text-gray-600 mb-6">この履歴を削除しますか？</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(deleteConfirmId);
                                    setDeleteConfirmId(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 全件削除確認ダイアログ */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold mb-2">確認</h3>
                        <p className="text-gray-600 mb-6">
                            すべての履歴を削除しますか？<br />
                            <span className="text-sm text-gray-400">この操作は取り消せません</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    onClearAll();
                                    setShowClearConfirm(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
