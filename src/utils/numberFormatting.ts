export function toHindiDigits(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const hindiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replaceAll(/\d/g, (digit) => hindiDigits[Number(digit)]);
}
