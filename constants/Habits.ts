/**
 * Defines the core daily prayer habits tracked by the app.
 */

export const PRAYER_HABITS = [
  { id: "fajr", name: "Fajr" },
  { id: "dhuhr", name: "Dhuhr" },
  { id: "asr", name: "Asr" },
  { id: "maghrib", name: "Maghrib" },
  { id: "isha", name: "Isha" },
];

export type PrayerHabit = (typeof PRAYER_HABITS)[number];
