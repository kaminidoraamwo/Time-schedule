
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { ProgressBar } from './components/ProgressBar';
import { CurrentStepControl } from './components/CurrentStepControl';
import { SummaryView } from './components/SummaryView';
import { Settings } from './components/Settings';

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
    requestNotificationPermission
  } = useTimer(steps);

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
              className="bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold py-8 px-16 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95"
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

            <div className="flex-grow flex items-center justify-center mt-8">
              {currentStep && (
                <CurrentStepControl
                  step={currentStep}
                  stepElapsedSeconds={stepElapsedSeconds}

                  onNext={nextStep}
                  onBack={previousStep}
                  isLastStep={state.currentStepIndex === steps.length - 1}
                  isFirstStep={state.currentStepIndex === 0}
                />
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
