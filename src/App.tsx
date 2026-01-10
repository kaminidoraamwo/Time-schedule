import { useTimer } from './hooks/useTimer';
import { ProgressBar } from './components/ProgressBar';
import { CurrentStepControl } from './components/CurrentStepControl';
import { SummaryView } from './components/SummaryView';

function App() {
  const {
    state,
    currentStep,
    totalElapsedSeconds,
    stepElapsedSeconds,
    start,
    nextStep,
    reset,
    isFinished
  } = useTimer();

  const isNotStarted = !state.isActive && state.currentStepIndex === 0;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-sm py-4 px-6 mb-6">
        <h1 className="text-xl font-bold text-gray-700">Salon Pacer</h1>
      </header>

      <main className="container mx-auto px-4 max-w-3xl">
        {isNotStarted && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-4xl font-bold mb-8 text-gray-800">Ready to start?</h2>
            <div className="text-gray-500 mb-12 text-center">
              Total Duration: 3h 30m<br />
              11 Steps
            </div>
            <button
              onClick={start}
              className="bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold py-8 px-16 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95"
            >
              START
            </button>
          </div>
        )}

        {state.isActive && (
          <div className="flex flex-col h-full">
            <ProgressBar
              totalElapsedSeconds={totalElapsedSeconds}
              currentStepIndex={state.currentStepIndex}
            />

            <div className="flex-grow flex items-center justify-center mt-8">
              <CurrentStepControl
                step={currentStep}
                stepElapsedSeconds={stepElapsedSeconds}
                onNext={nextStep}
                isLastStep={state.currentStepIndex === 10} // 11 steps, index 10 is last
              />
            </div>
          </div>
        )}

        {isFinished && (
          <SummaryView
            completedSteps={state.completedSteps}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}

export default App;
