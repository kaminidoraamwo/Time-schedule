/**
 * Shared type definitions for Salon Pacer
 */

// === Step Types ===
export type Step = {
  id: number;
  name: string;
  durationMinutes: number;
};

// === Timer Types ===
export type StepRecord = {
  stepId: number;
  plannedDuration: number; // Seconds
  actualDuration: number; // Seconds
  difference: number;
};

// 履歴保存用（工程名を含む）
export type StepRecordWithName = StepRecord & {
  stepName: string;
};

export type FinishReason = 'completed' | 'skipped' | null;

export type TimerState = {
  isActive: boolean;
  startTime: number | null;
  currentStepIndex: number;
  stepStartTime: number | null;
  completedSteps: StepRecord[];
  finishReason: FinishReason;
};

// === History Types ===
export type SessionRecord = {
  id: string;
  date: string; // ISO形式
  totalPlannedSeconds: number;
  totalActualSeconds: number;
  steps: StepRecordWithName[];
};

// === Settings Types ===
export type Preset = {
  id: string;
  name: string;
  steps: Step[];
};

// === Progress Status Types ===
export type ProgressLevel = 'ahead' | 'onTime' | 'slightlyLate' | 'veryLate';

export type ProgressStatus = {
  level: ProgressLevel;
  barColor: string;
  bgColor: string;
  textColor: string;
  message: string;
};

export type StepStatus = {
  level: 'good' | 'warning' | 'late';
  color: string;
  bgColor: string;
  text: string;
};
