import { format, subMinutes } from "date-fns";

let currentFajrCutoffMinutes = 0;

export function setFajrCutoff(fajrTime: Date | undefined) {
  if (fajrTime) {
    currentFajrCutoffMinutes = fajrTime.getHours() * 60 + fajrTime.getMinutes();
  }
}

/**
 * Returns a consistent string (YYYY-MM-DD) used as a database key
 * for a given date's habit entries (shifted to allow changes until fajr)
 */
export function getDateKey(date: Date = new Date()): string {
  const shifted = subMinutes(date, currentFajrCutoffMinutes);
  return format(shifted, "yyyy-MM-dd");
}
