import { useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useWakeLock } from './hooks/useWakeLock';
import { useHistory } from './hooks/useHistory';
import { ProgressBar } from './components/ProgressBar';
import { CurrentStepControl, LongPressButton } from './components/CurrentStepControl';
import { SummaryView } from './components/SummaryView';
import { Settings } from './components/Settings';
import { HistoryView } from './components/HistoryView';
import { formatTimeHMMSS } from './utils/time';

function App() {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
    deletePreset
  } = useSettings();

  const {
    state,
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
  } = useTimer(steps);

  const { history, addRecord, deleteRecord, clearAll } = useHistory();

  // Enable Screen Wake Lock when timer is active (disable during pause)
  useWakeLock(state.isActive && !state.isPaused);

  const isNotStarted = !state.isActive && state.currentStepIndex === 0 && !isFinished;
  const totalDurationMinutes = steps.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-sm py-4 px-6 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-700">Salon Pacer</h1>
        <div className="flex gap-4">
          <button
            onClick={toggleMute}
            className="text-2xl hover:scale-110 transition-transform"
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-500 hover:text-blue-600"
          >
            ⚙️ 設定
          </button>
        </div>
      </header>

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

      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">確認</h3>
            <p className="text-gray-600 mb-6">
              残りの工程をスキップして終了しますか？<br />
              <span className="text-sm text-gray-500">（この施術は履歴に保存されません）</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  skipToFinish();
                  setShowSkipConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                終了する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 古いセッション期限切れダイアログ */}
      {state.hasStaleSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">⏰ セッションの期限切れ</h3>
            <p className="text-gray-600 mb-2">
              前回のセッションは24時間以上経過したためリセットされます。
            </p>
            <p className="text-sm text-gray-500 mb-6">
              工程 {state.currentStepIndex + 1} / {steps.length}（{steps[state.currentStepIndex]?.name || '不明'}）まで進んでいました。
            </p>
            <button
              onClick={dismissStaleSession}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <main className={`container mx-auto max-w-3xl ${state.isActive ? 'px-2' : 'px-4'}`}>
        {isNotStarted && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-4xl font-bold mb-8 text-gray-800">準備はいいですか？</h2>
            <div className="text-gray-500 mb-12 text-center">
              合計時間: {Math.floor(totalDurationMinutes / 60)}時間 {totalDurationMinutes % 60}分<br />
              {steps.length} 工程
            </div>
            <button
              onClick={start}
              disabled={steps.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-3xl font-bold py-8 px-16 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100"
            >
              スタート
            </button>

            {/* 履歴ボタン（スタート画面のみ） */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="mt-8 text-gray-500 hover:text-blue-600 transition-colors"
            >
              📜 履歴を見る
            </button>
          </div>
        )}

        {state.isActive && (
          <div className="flex flex-col h-full">
            <ProgressBar
              steps={steps}
              totalElapsedSeconds={totalElapsedSeconds}
              currentStepIndex={state.currentStepIndex}
              stepElapsedSeconds={stepElapsedSeconds}
            />

            <div className="flex-grow flex flex-col items-center justify-center mt-4 space-y-4">
              {currentStep && (
                <>
                  <CurrentStepControl
                    step={currentStep}
                    stepElapsedSeconds={stepElapsedSeconds}
                    onNext={nextStep}
                    onBack={previousStep}
                    isPaused={state.isPaused}
                    isLastStep={state.currentStepIndex === steps.length - 1}
                    isFirstStep={state.currentStepIndex === 0}
                    nextStep={steps[state.currentStepIndex + 1]}
                    className="w-full"
                  />

                  <div className="flex flex-col items-center p-3 bg-white/50 rounded-xl">
                    <div className="text-gray-500 text-xs font-medium mb-0.5">経過時間 / 合計予定</div>
                    <div className="text-2xl font-bold text-gray-700 font-mono tracking-tight">
                      {formatTimeHMMSS(totalElapsedSeconds)}
                      <span className="text-gray-400 mx-2 text-lg align-middle">/</span>
                      {formatTimeHMMSS(totalDurationMinutes * 60)}
                    </div>
                  </div>

                  {/* 一時停止ボタン */}
                  <LongPressButton
                    onAction={togglePause}
                    progressColor={state.isPaused ? 'bg-green-300' : 'bg-gray-500'}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                      state.isPaused
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                        : 'bg-gray-400/30 hover:bg-gray-400/50 text-gray-600'
                    }`}
                  >
                    {state.isPaused ? '▶ 再開（長押し）' : '⏸ 一時停止（長押し）'}
                  </LongPressButton>

                  <button
                    onClick={() => setShowSkipConfirm(true)}
                    className="px-4 py-1.5 border border-red-200 text-red-400 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    強制終了（スキップ）
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {isFinished && (
          <SummaryView
            steps={steps}
            completedSteps={state.completedSteps}
            onReset={reset}
            finishReason={state.finishReason}
            startTime={state.startTime}
            onSaveHistory={addRecord}
          />
        )}
      </main>
    </div>
  );
}

export default App;
