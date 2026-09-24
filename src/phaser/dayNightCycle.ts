export function computeNightAlpha(hourOfDay: number): number {
  if (hourOfDay >= 7 && hourOfDay < 19) return 0;
  if (hourOfDay >= 21 || hourOfDay < 5) return 0.55;

  if (hourOfDay >= 19 && hourOfDay < 21) {
    return ((hourOfDay - 19) / 2) * 0.55;
  }
  return (1 - (hourOfDay - 5) / 2) * 0.55;
}
