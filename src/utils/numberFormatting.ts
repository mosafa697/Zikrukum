export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';

  // stop "to Hindi" feature for now
  // const hindiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  // return str.replaceAll(/\d/g, (digit) => hindiDigits[Number(digit)]);

  return String(value);
}
