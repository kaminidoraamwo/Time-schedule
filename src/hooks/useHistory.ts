import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, MAX_HISTORY_COUNT } from '../constants';
import type { SessionRecord, StepRecordWithName, StepRecord, Step } from '../types';

const STORAGE_KEY = STORAGE_KEYS.HISTORY;

/**
 * 履歴機能を管理するカスタムフック
 */
export const useHistory = () => {
    // ================================
    // 状態：履歴データ
    // ================================
    const [history, setHistory] = useState<SessionRecord[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // ================================
    // 履歴が変わったらlocalStorageに保存
    // ================================
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch {
            // 保存失敗時は静かに失敗（次回起動時に前の状態が読み込まれる）
        }
    }, [history]);

    // ================================
    // 新しい記録を追加
    // ================================
    const addRecord = useCallback((
        completedSteps: StepRecord[],
        steps: Step[],
        startTime: number | null
    ) => {
        // 24時間以上経過している場合は保存しない
        if (startTime) {
            const elapsed = Date.now() - startTime;
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            if (elapsed > ONE_DAY_MS) {
                return;
            }
        }

        // 重複チェック（直近1分以内の記録は重複とみなす）
        const now = Date.now();
        if (history.length > 0) {
            const lastRecord = history[0];
            const lastDate = new Date(lastRecord.date).getTime();
            if (now - lastDate < 60000) {
                return;
            }
        }

        // 工程名を含めた記録を作成
        const stepsWithName: StepRecordWithName[] = completedSteps.map(record => {
            const step = steps.find(s => s.id === record.stepId);
            return {
                ...record,
                stepName: step?.name || `工程${record.stepId}`,
            };
        });

        const newRecord: SessionRecord = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            totalPlannedSeconds: stepsWithName.reduce((sum, s) => sum + s.plannedDuration, 0),
            totalActualSeconds: stepsWithName.reduce((sum, s) => sum + s.actualDuration, 0),
            steps: stepsWithName,
        };

        setHistory(prev => {
            // 新しい記録を先頭に追加
            const updated = [newRecord, ...prev];
            // 100件を超えたら古いものを削除
            if (updated.length > MAX_HISTORY_COUNT) {
                return updated.slice(0, MAX_HISTORY_COUNT);
            }
            return updated;
        });
    }, [history]);

    // ================================
    // 1件削除
    // ================================
    const deleteRecord = useCallback((id: string) => {
        setHistory(prev => prev.filter(record => record.id !== id));
    }, []);

    // ================================
    // 全件削除
    // ================================
    const clearAll = useCallback(() => {
        setHistory([]);
    }, []);

    return {
        history,
        addRecord,
        deleteRecord,
        clearAll,
    };
};
