/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aesop design tokens (https://www.aesop.com/jp/)
      // クリーム × ダークグレーの二極構造。原色・蛍光色は使わない。
      colors: {
        cream: '#fffef2',        // シグネチャークリーム（背景・ダーク面上テキスト）
        'cream-alt': '#f6f5e8',  // クリームの微バリエーション（面）
        warm: '#f7ecdd',         // 温かみのあるベージュ面
        ink: '#333333',          // 本文・見出しの基本色（純黒は使わない）
        'ink-soft': '#666666',   // 補足テキスト・ラベル
        'ink-faint': '#9b9b95',  // 無効状態・ミュートテキスト
        line: '#ced4da',         // 区切り線・入力枠
        accent: '#006680',       // ティール（リンク等に控えめに）
        navy: '#27455c',         // 深い紺（差し色）
        forest: '#346e4a',       // フォレストグリーン（差し色）
      },
      fontFamily: {
        // 本文・UI: Suisse 系の代替として Inter + 端末標準の日本語ゴシック
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          'Meiryo',
          'sans-serif',
        ],
        // セクションタイトル: Zapf-Humanist の代替として明朝/ヒューマニストセリフ
        serif: [
          '"Hiragino Mincho ProN"',
          '"Yu Mincho"',
          'YuMincho',
          'Palatino',
          '"Book Antiqua"',
          'serif',
        ],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
