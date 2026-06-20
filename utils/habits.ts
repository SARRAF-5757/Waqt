export type HabitHistoryItem = {
  date: string;
  statuses: Record<string, boolean>;
};

/**
 * Looks up prayer completion status for a specific date string in the provided history array
 */
export function getStatusesForDate(historyData: HabitHistoryItem[], dateKey: string) {
  for (let i = 0; i < historyData.length; i++) {
    const habitEntry = historyData[i];
    if (habitEntry.date === dateKey && habitEntry.statuses) {
      return habitEntry.statuses;
    }
  }
  return {};
}
