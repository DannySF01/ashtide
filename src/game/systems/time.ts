export const TICKS_PER_HOUR = 6; // one tick = 10 in-game minutes
export const HOURS_PER_DAY = 24;
export const TICKS_PER_DAY = TICKS_PER_HOUR * HOURS_PER_DAY;

export interface TimeState {
  day: number;
  hourOfDay: number; // 0 to 24, fractional
}

export interface TimeAdvanceResult {
  time: TimeState;
  daysPassed: number;
  ticksElapsed: number;
}

/** Advances the clock by a number of ticks, rolling over days as needed. */
export function advanceTime(time: TimeState, ticks: number): TimeAdvanceResult {
  const hoursToAdd = ticks / TICKS_PER_HOUR;
  const totalHours = time.day * HOURS_PER_DAY + time.hourOfDay + hoursToAdd;

  const newDay = Math.floor(totalHours / HOURS_PER_DAY);
  const newHourOfDay = totalHours - newDay * HOURS_PER_DAY;

  return {
    time: { day: newDay, hourOfDay: newHourOfDay },
    daysPassed: newDay - time.day,
    ticksElapsed: ticks,
  };
}

export function isNight(hourOfDay: number): boolean {
  return hourOfDay >= 20 || hourOfDay < 6;
}

/**
 * Converts elapsed real time (ms) since the last save into game ticks,
 * capped so a very long absence doesn't simulate an absurd number of ticks
 * at once (prevents freezing the app on load after weeks away).
 */
export function elapsedMsToTicks(
  elapsedMs: number,
  msPerTick: number,
  maxTicks: number,
): number {
  const rawTicks = Math.floor(elapsedMs / msPerTick);
  return Math.max(0, Math.min(rawTicks, maxTicks));
}
