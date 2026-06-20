import { format } from "date-fns";

/**
 * Returns a consistent string (YYYY-MM-DD) used as a database key
 * for a given date's habit entries
 */
export function getDateKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}
