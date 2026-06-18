/**
 * スケジュール（工程リスト）に関する純粋な集計・検証ロジック。
 * 合計時間の計算が複数コンポーネントに散在していたため集約（DRY）。
 */
import type { Step } from '../types';

/** 1工程あたりの最小許容時間（分）。これ未満は保存・開始をブロックする。 */
export const MIN_STEP_MINUTES = 1;

/** これより短い合計時間は「やわらかい注意」を出す（ブロックはしない）。 */
export const SHORT_TOTAL_MINUTES = 30;

/** これより長い合計時間は「やわらかい注意」を出す（ブロックはしない）。 */
export const LONG_TOTAL_MINUTES = 360;

/** 全工程の所要時間（分）の合計を返す。 */
export const getTotalDurationMinutes = (steps: readonly Step[]): number =>
  steps.reduce((acc, step) => acc + step.durationMinutes, 0);

/**
 * 合計分を「約N時間M分」の見やすいラベルに整形する（カード表示などの概算用）。
 */
export const formatTotalDurationLabel = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `約${minutes}分`;
  if (minutes === 0) return `約${hours}時間`;
  return `約${hours}時間${minutes}分`;
};

/**
 * 開始時刻に合計分を足した「終了予定時刻」を返す。
 * 引数の Date は変更しない（イミュータブル）。
 */
export const getEndTime = (start: Date, totalMinutes: number): Date =>
  new Date(start.getTime() + totalMinutes * 60_000);

export type ScheduleValidation = {
  /** 保存・開始してよいか（0件でない & 全工程が最小時間以上）。 */
  isValid: boolean;
  /** 最小時間未満 or 非数の工程 id 一覧（ブロック対象）。 */
  invalidStepIds: number[];
  /** 工程が1件も無い。 */
  hasNoSteps: boolean;
  /** ブロックはしないやわらかい注意（短すぎ/長すぎ）。無ければ null。 */
  warning: string | null;
};

const isValidDuration = (durationMinutes: number): boolean =>
  Number.isFinite(durationMinutes) && durationMinutes >= MIN_STEP_MINUTES;

/**
 * スケジュールの妥当性を境界で検証する（fail-fast 用の集約結果を返す）。
 */
export const validateSchedule = (steps: readonly Step[]): ScheduleValidation => {
  const invalidStepIds = steps
    .filter((step) => !isValidDuration(step.durationMinutes))
    .map((step) => step.id);

  const hasNoSteps = steps.length === 0;
  const total = getTotalDurationMinutes(steps);

  let warning: string | null = null;
  if (!hasNoSteps && total < SHORT_TOTAL_MINUTES) {
    warning = '合計時間が短めです（30分未満）';
  } else if (total > LONG_TOTAL_MINUTES) {
    warning = '合計時間が長めです（6時間超）';
  }

  return {
    isValid: !hasNoSteps && invalidStepIds.length === 0,
    invalidStepIds,
    hasNoSteps,
    warning,
  };
};
