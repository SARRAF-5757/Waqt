import { format, subMinutes } from "date-fns";

/**
 * Exact time of the day Fajr starts- used to
 * offset the day boundaries to allow changes to
 * the day's prayers until Fajr.
 */
let currentFajrCutoffMinutes = 0;

/**
 * Updates the Fajr cutoff time globally.
 * Called automatically by the prayerTimesProvider when times are loaded.
 */
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
