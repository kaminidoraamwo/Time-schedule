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
  stepName?: string; // 任意: 記録時の工程名スナップショット（後からの改名/読込で履歴名がズレるのを防ぐ）
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
  hasStaleSession?: boolean;
  isPaused: boolean;
  pausedAt: number | null;
  totalPausedMs: number;
  workingSteps?: Step[]; // 任意: START時に固定する工程のワーキングコピー。セッション中の真実源
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
  icon?: string; // 任意: ギャラリー表示用の絵文字（例: '💧'）
  category?: string; // 任意: フィルタ用
  isTemplate?: boolean; // 任意: 同梱テンプレ（true）か、ユーザー保存プリセット（false/未定義）か
  createdAt?: number; // 任意: 作成時刻（Unix ミリ秒）
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
