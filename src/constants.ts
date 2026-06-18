import type { Step, Preset } from './types';

// LocalStorage keys - centralized management
export const STORAGE_KEYS = {
  TIMER_STATE: 'salon-pacer-state',
  SETTINGS: 'salon-pacer-settings',
  PRESETS: 'salon-pacer-presets',
  HISTORY: 'salon-pacer-history',
  ONBOARDED: 'salon-pacer-onboarded',
} as const;

// 履歴の最大保存件数
export const MAX_HISTORY_COUNT = 100;

// 工程編集でよく使う時間チップ（分）
export const QUICK_DURATIONS = [5, 10, 15, 20, 30, 45, 60];

// 「よく使う工程から追加」のプリセット名
export const STEP_PRESET_NAMES = ['カウンセリング', 'シャンプー', '薬剤塗布', '薬剤放置', '中間処理', 'ドライヤー', 'アイロン', '２液', '仕上げ・撮影'];

export const SCHEDULE_STEPS: Step[] = [
  { id: 1, name: 'カウンセリング', durationMinutes: 20 },
  { id: 2, name: 'シャンプー', durationMinutes: 10 },
  { id: 3, name: '準備・薬剤塗布', durationMinutes: 20 },
  { id: 4, name: '薬剤放置', durationMinutes: 30 },
  { id: 5, name: 'シャンプー', durationMinutes: 10 },
  { id: 6, name: '中間処理', durationMinutes: 5 },
  { id: 7, name: 'ドライヤー', durationMinutes: 10 },
  { id: 8, name: 'アイロンチェック', durationMinutes: 10 },
  { id: 9, name: 'アイロン', durationMinutes: 40 },
  { id: 10, name: '２液', durationMinutes: 15 },
  { id: 11, name: 'シャンプー', durationMinutes: 10 },
  { id: 12, name: 'ドライヤー・仕上げ・撮影', durationMinutes: 30 },
];

// カラー（約1時間50分・7工程）
export const COLOR_STEPS: Step[] = [
  { id: 1, name: 'カウンセリング', durationMinutes: 15 },
  { id: 2, name: '薬剤調合・塗布', durationMinutes: 25 },
  { id: 3, name: '薬剤放置', durationMinutes: 30 },
  { id: 4, name: 'シャンプー', durationMinutes: 10 },
  { id: 5, name: 'トリートメント', durationMinutes: 10 },
  { id: 6, name: 'ドライヤー', durationMinutes: 10 },
  { id: 7, name: '仕上げ・撮影', durationMinutes: 10 },
];

// パーマ（約2時間・9工程）
export const PERM_STEPS: Step[] = [
  { id: 1, name: 'カウンセリング', durationMinutes: 15 },
  { id: 2, name: 'シャンプー', durationMinutes: 10 },
  { id: 3, name: 'ロッド巻き', durationMinutes: 25 },
  { id: 4, name: '１液塗布・放置', durationMinutes: 20 },
  { id: 5, name: '中間水洗・チェック', durationMinutes: 10 },
  { id: 6, name: '２液塗布・放置', durationMinutes: 15 },
  { id: 7, name: 'ロッドアウト・シャンプー', durationMinutes: 10 },
  { id: 8, name: 'ドライヤー', durationMinutes: 10 },
  { id: 9, name: '仕上げ・撮影', durationMinutes: 10 },
];

// トリートメント（約45分・5工程）
export const TREATMENT_STEPS: Step[] = [
  { id: 1, name: 'カウンセリング', durationMinutes: 5 },
  { id: 2, name: 'シャンプー', durationMinutes: 10 },
  { id: 3, name: '薬剤塗布・浸透', durationMinutes: 15 },
  { id: 4, name: '流し・ブロー', durationMinutes: 10 },
  { id: 5, name: '仕上げ・撮影', durationMinutes: 5 },
];

// 髪質改善トリートメント α（微還元・約120分・9工程）。開発者の現場フローに合わせて確定。
export const KAISHITSU_ALPHA_STEPS: Step[] = [
  { id: 1, name: 'プレシャンプー', durationMinutes: 10 },
  { id: 2, name: '準備・薬剤塗布', durationMinutes: 20 },
  { id: 3, name: '薬剤放置', durationMinutes: 20 },
  { id: 4, name: '中間水洗', durationMinutes: 10 },
  { id: 5, name: 'ドライ', durationMinutes: 10 },
  { id: 6, name: 'アイロン', durationMinutes: 15 },
  { id: 7, name: '酸化処理', durationMinutes: 5 },
  { id: 8, name: 'シャンプー', durationMinutes: 10 },
  { id: 9, name: 'ドライ・仕上げ', durationMinutes: 20 },
];

// 髪質改善トリートメント β（酸熱・約90分・7工程）。開発者の現場フローに合わせて確定。
export const KAISHITSU_BETA_STEPS: Step[] = [
  { id: 1, name: 'プレシャンプー', durationMinutes: 10 },
  { id: 2, name: '準備・薬剤塗布', durationMinutes: 15 },
  { id: 3, name: '薬剤放置(加温)', durationMinutes: 20 },
  { id: 4, name: '中間水洗', durationMinutes: 10 },
  { id: 5, name: 'ドライ', durationMinutes: 10 },
  { id: 6, name: 'アイロン', durationMinutes: 20 },
  { id: 7, name: '仕上げ', durationMinutes: 5 },
];

// 同梱テンプレート（ユーザー保存プリセットとは別配列で合流表示する）
export const TEMPLATES: Preset[] = [
  { id: 'tpl-straightening', name: '縮毛矯正', icon: '💧', isTemplate: true, steps: SCHEDULE_STEPS },
  { id: 'tpl-color', name: 'カラー', icon: '🎨', isTemplate: true, steps: COLOR_STEPS },
  { id: 'tpl-perm', name: 'パーマ', icon: '🌀', isTemplate: true, steps: PERM_STEPS },
  { id: 'tpl-treatment', name: 'トリートメント', icon: '✨', isTemplate: true, steps: TREATMENT_STEPS },
  { id: 'tpl-kaishitsu-alpha', name: '髪質改善トリートメント α（微還元）', icon: '💜', isTemplate: true, steps: KAISHITSU_ALPHA_STEPS },
  { id: 'tpl-kaishitsu-beta', name: '髪質改善トリートメント β（酸熱）', icon: '🌸', isTemplate: true, steps: KAISHITSU_BETA_STEPS },
];
