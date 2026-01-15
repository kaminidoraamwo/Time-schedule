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

export type TimerState = {
  isActive: boolean;
  startTime: number | null;
  currentStepIndex: number;
  stepStartTime: number | null;
  completedSteps: StepRecord[];
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
