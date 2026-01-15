/**
 * Converts total seconds into Hours, Minutes, Seconds components
 */
export const getDurationParts = (totalSeconds: number) => {
    const absSeconds = Math.abs(totalSeconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = Math.floor(absSeconds % 60);
    const sign = totalSeconds < 0 ? '-' : '';
    return { h, m, s, sign };
};

/**
 * MM:SS format (e.g. 05:00, 12:34)
 * If hours exist, they are included in minutes (e.g. 65:00) unless allowHours is true? 
 * Actually existing logic uses "m" as total minutes in CurrentStepControl.
 */
export const formatTimeMMSS = (seconds: number) => {
    const { m, s, h, sign } = getDurationParts(seconds);
    // CurrentStepControl logic was: Math.floor(seconds / 60) for minutes.
    // So 1 hour = 60 minutes.
    const totalMinutes = h * 60 + m;
    return `${sign}${totalMinutes.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * H:MM:SS format (e.g. 0:05:00, 1:30:00)
 * Used in main timer display
 */
export const formatTimeHMMSS = (seconds: number) => {
    const { h, m, s, sign } = getDurationParts(seconds);
    return `${sign}${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * 秒を「○分○秒」形式に変換（日本語）
 * Used in SummaryView, HistoryDetailView
 */
export const formatTimeJapanese = (seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = Math.floor(absSeconds % 60);
    const sign = seconds < 0 ? '-' : '';
    if (mins === 0) return `${sign}${secs}秒`;
    return `${sign}${mins}分${secs}秒`;
};

/**
 * 日付を日本語形式に変換
 * Used in SummaryView, HistoryView, HistoryDetailView
 */
export const formatDateJapanese = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * 秒を「○時間○分」形式に変換（履歴一覧用）
 * Used in HistoryView
 */
export const formatDurationJapanese = (seconds: number): string => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) return `${hours}時間${mins}分`;
    return `${totalMinutes}分`;
};

/**
 * Natural language format for differences (e.g. 3分, 1分30秒)
 * Used in ProgressBar status messages
 */
export const formatDiffNatural = (seconds: number): string => {
    const abs = Math.abs(Math.round(seconds));
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;

    if (mins === 0) {
        return `${secs}秒`;
    } else if (secs === 0) {
        return `${mins}分`;
    } else {
        return `${mins}分${secs}秒`;
    }
};
