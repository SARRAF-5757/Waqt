import { format, subHours } from "date-fns";

export const PRAYER_HABITS = [
  { id: "fajr", name: "Fajr" },
  { id: "dhuhr", name: "Dhuhr" },
  { id: "asr", name: "Asr" },
  { id: "maghrib", name: "Maghrib" },
  { id: "isha", name: "Isha" },
];

// storage / context key
// Note: Day changes at 4 AM instead of midnight
// This allows users to edit the previous day until 4 AM
export const getDateKey = (d = new Date()) => {
  const shifted = subHours(d, 4);
  return format(shifted, "yyyy-MM-dd");
};
