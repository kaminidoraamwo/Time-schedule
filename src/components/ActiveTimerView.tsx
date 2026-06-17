import React, { useState, useEffect, useRef } from 'react';
import type { Step } from '../types';
import { ProgressBar } from './ProgressBar';
import { CurrentStepControl, LongPressButton } from './CurrentStepControl';
import { InSessionEditPanel, type FutureStep } from './InSessionEditPanel';
import { formatTimeHMMSS, formatClockTime } from '../utils/time';

const UNDO_TIMEOUT_MS = 5000;

type Props = {
    steps: Step[];
    currentStepIndex: number;
    currentStep: Step | undefined;
    totalElapsedSeconds: number;
    stepElapsedSeconds: number;
    now: number;
    isPaused: boolean;
    isEditable?: boolean;
    totalDurationMinutes: number;
    onNextStep: () => void;
    onPreviousStep: () => void;
    onTogglePause: () => void;
    onSkipToFinish: () => void;
    onInsertStep: (draft: { name: string; durationMinutes: number }) => void;
    onSkipStep: (index: number) => void;
    onRestoreSteps: (steps: Step[]) => void;
};

export const ActiveTimerView: React.FC<Props> = ({
    steps,
    currentStepIndex,
    currentStep,
    totalElapsedSeconds,
    stepElapsedSeconds,
    now,
    isPaused,
    isEditable = true,
    totalDurationMinutes,
    onNextStep,
    onPreviousStep,
    onTogglePause,
    onSkipToFinish,
    onInsertStep,
    onSkipStep,
    onRestoreSteps,
}) => {
    // === 施術中の工程編集（第3波 MVP） ===
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [undoSteps, setUndoSteps] = useState<Step[] | null>(null);
    const pausedByEditRef = useRef(false);

    // これからの工程（現在より後）のみ編集対象
    const futureSteps: FutureStep[] = steps
        .map((step, index) => ({ step, index }))
        .filter(({ index }) => index > currentStepIndex);

    const openEdit = () => {
        // 自動 PAUSE（ユーザーが既に一時停止していなければ）
        if (!isPaused) {
            onTogglePause();
            pausedByEditRef.current = true;
        }
        setIsEditOpen(true);
    };

    const closeEdit = () => {
        setIsEditOpen(false);
        // 自動 RESUME（編集のために止めていた場合のみ）
        if (pausedByEditRef.current) {
            onTogglePause();
            pausedByEditRef.current = false;
        }
    };

    const handleInsert = (draft: { name: string; durationMinutes: number }) => {
        setUndoSteps(steps); // 編集前のスナップショットを保持
        onInsertStep(draft);
        closeEdit();
    };

    const handleSkip = (index: number) => {
        setUndoSteps(steps);
        onSkipStep(index);
        closeEdit();
    };

    const handleUndo = () => {
        if (undoSteps) onRestoreSteps(undoSteps);
        setUndoSteps(null);
    };

    // Undo トーストは5秒で自動的に消える
    useEffect(() => {
        if (!undoSteps) return;
        const timer = setTimeout(() => setUndoSteps(null), UNDO_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [undoSteps]);

    // 完了予定時刻 = 現在時刻 + 残り時間（現工程の残り + 以降の工程の予定合計）
    const currentPlannedSeconds = (currentStep?.durationMinutes ?? 0) * 60;
    const remainingCurrentStep = Math.max(0, currentPlannedSeconds - stepElapsedSeconds);
    const futureStepsSeconds = steps
        .slice(currentStepIndex + 1)
        .reduce((acc, s) => acc + s.durationMinutes * 60, 0);
    const remainingTotalSeconds = remainingCurrentStep + futureStepsSeconds;
    // useTimer が追跡する now を使う（render中の Date.now() 呼び出しを避ける／経過と同期）
    const finishAt = new Date(now + remainingTotalSeconds * 1000);

    return (
        <div className="flex flex-col h-full">
            <ProgressBar
                steps={steps}
                totalElapsedSeconds={totalElapsedSeconds}
                currentStepIndex={currentStepIndex}
                stepElapsedSeconds={stepElapsedSeconds}
            />

            <div className="flex-grow flex flex-col items-center pb-6">
                {currentStep && (
                    <>
                        <CurrentStepControl
                            step={currentStep}
                            stepElapsedSeconds={stepElapsedSeconds}
                            onNext={onNextStep}
                            onBack={onPreviousStep}
                            isPaused={isPaused}
                            isLastStep={currentStepIndex === steps.length - 1}
                            isFirstStep={currentStepIndex === 0}
                            nextStep={steps[currentStepIndex + 1]}
                            className="w-full"
                        />

                        <div className="flex flex-col items-center justify-evenly w-full flex-grow mt-6 gap-2">
                            {/* 完了予定の時刻 */}
                            <div className="flex items-baseline gap-3 px-5 py-2 bg-cream border border-line rounded-none">
                                <span className="text-ink-soft text-xs">🏁 完了予定</span>
                                <span className="text-2xl font-bold text-ink font-mono tracking-tight tabular-nums">
                                    {formatClockTime(finishAt)}
                                </span>
                            </div>

                            <div className="flex flex-col items-center p-3 bg-cream-alt border border-line rounded-none">
                                <div className="text-ink-soft text-xs font-medium mb-0.5">経過時間 / 合計予定</div>
                                <div className="text-2xl font-bold text-ink font-mono tracking-tight">
                                    {formatTimeHMMSS(totalElapsedSeconds)}
                                    <span className="text-ink-faint mx-2 text-lg align-middle">/</span>
                                    {formatTimeHMMSS(totalDurationMinutes * 60)}
                                </div>
                            </div>

                            {/* 一時停止ボタン */}
                            <LongPressButton
                                onAction={onTogglePause}
                                progressColor={isPaused ? 'bg-cream/50' : 'bg-ink/40'}
                                className={`px-6 py-2 rounded-none text-sm font-medium transition-colors mt-2 ${
                                    isPaused
                                        ? 'bg-forest hover:opacity-90 text-cream'
                                        : 'bg-transparent border border-ink/40 hover:bg-ink/5 text-ink-soft'
                                }`}
                            >
                                {isPaused ? '▶ 再開（長押し）' : '⏸ 一時停止（長押し）'}
                            </LongPressButton>

                            {/* 施術中の工程編集（開くとタイマーは自動で一時停止）。練習モードでは非表示 */}
                            {isEditable && (
                                <button
                                    onClick={openEdit}
                                    className="px-5 py-2 border border-ink/40 text-ink-soft rounded-none text-sm hover:bg-ink/5 hover:text-ink transition-colors mt-2"
                                >
                                    ✎ 工程を編集
                                </button>
                            )}

                            <LongPressButton
                                onAction={onSkipToFinish}
                                progressColor="bg-red-400"
                                className="px-4 py-1.5 border border-red-300 text-red-500 rounded-none text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors mt-6"
                            >
                                強制終了（長押し）
                            </LongPressButton>
                        </div>
                    </>
                )}
            </div>

            {/* 施術中の工程編集パネル */}
            {isEditOpen && (
                <InSessionEditPanel
                    futureSteps={futureSteps}
                    onInsert={handleInsert}
                    onSkip={handleSkip}
                    onClose={closeEdit}
                />
            )}

            {/* Undo トースト（編集直後5秒） */}
            {undoSteps && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-ink text-cream px-5 py-3 rounded-none shadow-lg">
                    <span className="text-sm">工程を変更しました</span>
                    <button
                        onClick={handleUndo}
                        className="text-sm font-bold underline underline-offset-2 hover:opacity-80"
                    >
                        元に戻す
                    </button>
                </div>
            )}
        </div>
    );
};
