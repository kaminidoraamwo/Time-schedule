export type Step = {
  id: number;
  name: string;
  durationMinutes: number;
};

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
