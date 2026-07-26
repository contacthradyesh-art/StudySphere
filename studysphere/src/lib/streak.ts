export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDayMs(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}
