import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// globals を無効にしているため、RTL の自動クリーンアップを手動登録する
afterEach(() => {
  cleanup();
});
