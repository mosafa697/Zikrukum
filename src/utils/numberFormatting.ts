export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';

  // stop "to Hindi" feature for now
  // const hindiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  // return str.replaceAll(/\d/g, (digit) => hindiDigits[Number(digit)]);

  return String(value);
}

/**
 * Format a duration in seconds as mm:ss for the audio player.
 * Negative or non-finite values fall back to 0:00.
 */
export function formatAudioTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
