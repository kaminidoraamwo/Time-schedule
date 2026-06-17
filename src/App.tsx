import { useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useWakeLock } from './hooks/useWakeLock';
import { useHistory } from './hooks/useHistory';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { ActiveTimerView } from './components/ActiveTimerView';
import { SummaryView } from './components/SummaryView';
import { Settings } from './components/Settings';
import { HistoryView } from './components/HistoryView';
import { Onboarding } from './components/Onboarding';
import { getTotalDurationMinutes, validateSchedule } from './utils/schedule';
import { STORAGE_KEYS } from './constants';

function App() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
    } catch {
      return true; // localStorage 不可ならオンボーディングは出さない
    }
  });

  const completeOnboarding = () => {
    setIsOnboarded(true);
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    } catch {
      // 保存失敗は無視（次回また表示されるだけ）
    }
  };

  const {
    steps,
    isOpen: isSettingsOpen,
    setIsOpen: setIsSettingsOpen,
    updateStep,
    addStep,
    removeStep,
    moveStep,
    resetToDefault,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    applyTemplate,
    duplicateStep,
    addNamedStep,
    reorderSteps
  } = useSettings();

  const {
    state,
    now,
    activeSteps,
    currentStep,
    totalElapsedSeconds,
    stepElapsedSeconds,
    start,
    nextStep,
    previousStep,
    reset,
    isFinished,
    isMuted,
    toggleMute,
    skipToFinish,
    togglePause,
    dismissStaleSession,
    insertFutureStep,
    skipFutureStep,
    restoreWorkingSteps,
  } = useTimer(steps);

  const { history, addRecord, deleteRecord, clearAll } = useHistory();

  // Enable Screen Wake Lock when timer is active (disable during pause)
  useWakeLock(state.isActive && !state.isPaused);

  const isNotStarted = !state.isActive && state.currentStepIndex === 0 && !isFinished;
  const totalDurationMinutes = getTotalDurationMinutes(steps);
  const canStart = validateSchedule(steps).isValid;
  // 進行中/完了サマリーは固定済みの activeSteps を真実源にする（設定編集の影響を受けない）
  const activeTotalDurationMinutes = getTotalDurationMinutes(activeSteps);

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <Header
        isActive={state.isActive}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {!isOnboarded && isNotStarted && (
        <Onboarding
          onSelectTemplate={(id) => { applyTemplate(id); completeOnboarding(); }}
          onSkip={completeOnboarding}
        />
      )}

      <Settings
        steps={steps}
        presets={presets}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateStep={updateStep}
        onAddStep={addStep}
        onRemoveStep={removeStep}
        onMoveStep={moveStep}
        onResetToDefault={resetToDefault}
        onSavePreset={savePreset}
        onLoadPreset={loadPreset}
        onDeletePreset={deletePreset}
        onApplyTemplate={applyTemplate}
        onDuplicateStep={duplicateStep}
        onAddNamedStep={addNamedStep}
        onReorderStep={reorderSteps}
      />

      {/* 履歴画面 */}
      {isHistoryOpen && (
        <HistoryView
          history={history}
          onDelete={deleteRecord}
          onClearAll={clearAll}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* 古いセッション期限切れダイアログ */}
      {state.hasStaleSession && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-none border border-line p-6 max-w-sm w-full mx-4">
            <h3 className="font-serif text-lg text-ink mb-2">セッションの期限切れ</h3>
            <p className="text-ink-soft mb-2">
              前回のセッションは24時間以上経過したためリセットされます。
            </p>
            <p className="text-sm text-ink-faint mb-6">
              工程 {state.currentStepIndex + 1} / {activeSteps.length}（{activeSteps[state.currentStepIndex]?.name || '不明'}）まで進んでいました。
            </p>
            <button
              onClick={dismissStaleSession}
              className="w-full px-4 py-3 bg-ink text-cream rounded-none hover:opacity-90 transition-opacity font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <main className={`container mx-auto max-w-3xl ${state.isActive ? 'px-2' : 'px-4'}`}>
        {isNotStarted && (
          <StartScreen
            stepsCount={steps.length}
            totalDurationMinutes={totalDurationMinutes}
            canStart={canStart}
            onStart={start}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {state.isActive && (
          <ActiveTimerView
            steps={activeSteps}
            currentStepIndex={state.currentStepIndex}
            currentStep={currentStep || undefined}
            totalElapsedSeconds={totalElapsedSeconds}
            stepElapsedSeconds={stepElapsedSeconds}
            now={now}
            isPaused={state.isPaused}
            isEditable={state.mode !== 'practice'}
            totalDurationMinutes={activeTotalDurationMinutes}
            onNextStep={nextStep}
            onPreviousStep={previousStep}
            onTogglePause={togglePause}
            onSkipToFinish={skipToFinish}
            onInsertStep={insertFutureStep}
            onSkipStep={skipFutureStep}
            onRestoreSteps={restoreWorkingSteps}
          />
        )}

        {isFinished && (
          <SummaryView
            steps={activeSteps}
            completedSteps={state.completedSteps}
            onReset={reset}
            finishReason={state.finishReason}
            startTime={state.startTime}
            mode={state.mode}
            onSaveHistory={addRecord}
          />
        )}
      </main>
    </div>
  );
}

export default App;
