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
 * Xm Ys format (e.g. 10m 5s)
 * Used in Summary View
 */
export const formatTimeShort = (seconds: number) => {
    const { m, s, h, sign } = getDurationParts(seconds);
    const totalMinutes = h * 60 + m;
    return `${sign}${totalMinutes}m ${s}s`;
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
