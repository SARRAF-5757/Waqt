export type HabitHistoryItem = {
  date: string;
  statuses: Record<string, boolean>;
};

export function getStatusesForDate(historyData: HabitHistoryItem[], dateKey: string) {
  for (let i = 0; i < historyData.length; i++) {
    const habitEntry = historyData[i];
    if (habitEntry.date === dateKey && habitEntry.statuses) {
      return habitEntry.statuses;
    }
  }
  return {};
}
