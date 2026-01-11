
import { useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useNotification } from './hooks/useNotification';
import { ProgressBar } from './components/ProgressBar';
import { CurrentStepControl } from './components/CurrentStepControl';
import { SummaryView } from './components/SummaryView';
import { Settings } from './components/Settings';
import { onMessage, messaging } from './lib/firebase';
import type { MessagePayload } from 'firebase/messaging';

function App() {
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
    permissionStatus,

    schedulePushNotification,
    cancelPushNotification
  } = useNotification();

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
    requestNotificationPermission,
    skipToFinish
  } = useTimer(steps, schedulePushNotification, cancelPushNotification);

  // Listen for foreground notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (message: MessagePayload) => {
      console.log('Foreground message received:', message);
      const title = message.notification?.title || 'Notification';
      const body = message.notification?.body || '';
      // Show system notification even if in foreground (if permitted)
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else {
        alert(`${title}\n${body}`);
      }
    });
    return () => unsubscribe();
  }, []);



  const isNotStarted = !state.isActive && state.currentStepIndex === 0;
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
        onRequestNotificationPermission={requestNotificationPermission}
        permissionStatus={permissionStatus}
      />

      <main className="container mx-auto px-4 max-w-3xl">
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
          </div>
        )}

        {state.isActive && (
          <div className="flex flex-col h-full">
            <ProgressBar
              steps={steps}
              totalElapsedSeconds={totalElapsedSeconds}
            />

            <div className="flex-grow flex flex-col items-center justify-center mt-8 space-y-8">
              {currentStep && (
                <>
                  <CurrentStepControl
                    step={currentStep}
                    stepElapsedSeconds={stepElapsedSeconds}
                    onNext={nextStep}
                    onBack={previousStep}
                    isLastStep={state.currentStepIndex === steps.length - 1}
                    isFirstStep={state.currentStepIndex === 0}
                    nextStep={steps[state.currentStepIndex + 1]}
                  />

                  <div className="flex flex-col items-center p-4 bg-white/50 rounded-xl">
                    <div className="text-gray-500 text-sm font-medium mb-1">経過時間 / 合計予定</div>
                    <div className="text-3xl font-bold text-gray-700 font-mono tracking-tight">
                      {Math.floor(totalElapsedSeconds / 3600)}:{(Math.floor((totalElapsedSeconds % 3600) / 60)).toString().padStart(2, '0')}:{Math.floor(totalElapsedSeconds % 60).toString().padStart(2, '0')}
                      <span className="text-gray-400 mx-2 text-xl align-middle">/</span>
                      {Math.floor(totalDurationMinutes / 60)}:{(totalDurationMinutes % 60).toString().padStart(2, '0')}:00
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('残りの工程をスキップして終了しますか？\n（現在までの記録は保存されます）')) {
                        skipToFinish();
                      }
                    }}
                    className="mt-2 px-4 py-2 border border-red-200 text-red-400 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
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
          />
        )}
      </main>
    </div>
  );
}

export default App;
