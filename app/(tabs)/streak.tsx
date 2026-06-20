import React from "react";
import { StyleSheet, ScrollView, ActivityIndicator, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subDays, subHours } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { PRAYER_HABITS } from "@/constants/Habits";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabits } from "@/providers/habitProvider";
import { getDateKey } from "@/utils/dateKey";

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS_TO_SHOW = 105;

type DayCell = {
  date: Date;
  dateKey: string;
  isCompleted: boolean;
};

type PrayerContributionGraphProps = {
  prayerId: string;
  prayerName: string;
};

/**
 * GitHub-style contribution grid for one prayer.
 */
function PrayerContributionGraph({ prayerId, prayerName }: PrayerContributionGraphProps) {
  const { historyData } = useHabits();
  const colors = useThemeColors();

  // Collect every date where this specific prayer was marked complete.
  const completedDates = new Set<string>();
  for (let i = 0; i < historyData.length; i++) {
    const entry = historyData[i];
    if (entry.statuses[prayerId]) {
      completedDates.add(entry.date);
    }
  }

  // Build one cell per day for the last 105 days.
  const dayCells: DayCell[] = [];
  const now = new Date();

  for (let daysBack = DAYS_TO_SHOW - 1; daysBack >= 0; daysBack--) {
    const calendarDate = subDays(now, daysBack);
    const dateKey = getDateKey(calendarDate);

    // Shift by 4 hours so weekday labels line up visually in the grid.
    const shiftedDate = subHours(calendarDate, 4);

    dayCells.push({
      date: shiftedDate,
      dateKey,
      isCompleted: completedDates.has(dateKey),
    });
  }

  // Find the first Sunday so week columns start on Sunday.
  let firstSundayIndex = 0;
  for (let i = 0; i < dayCells.length; i++) {
    if (dayCells[i].date.getDay() === 0) {
      firstSundayIndex = i;
      break;
    }
  }

  // Split days into week columns of 7 cells each.
  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  for (let i = firstSundayIndex; i < dayCells.length; i++) {
    currentWeek.push(dayCells[i]);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad the final partial week with blank placeholders.
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(0),
        dateKey: "",
        isCompleted: false,
      });
    }
    weeks.push(currentWeek);
  }

  const isIOS = Platform.OS === "ios";

  return (
    <View style={styles.graphContainer}>
      <View style={[styles.prayerBox, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
        <ThemedText style={styles.prayerHeader}>{prayerName}</ThemedText>
      </View>

      <View style={[styles.graphCardContent, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
        <View style={styles.graphRow}>
          <View style={styles.weekdayColumn}>
            {WEEKDAY_LETTERS.map((letter, index) => (
              <ThemedText key={index} style={styles.weekdayLetter}>
                {letter}
              </ThemedText>
            ))}
          </View>

          <View style={styles.contributionGraph}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekColumn}>
                {week.map((day, dayIndex) => (
                  <View key={dayIndex} style={styles.dayContainer}>
                    {day.dateKey ? (
                      <View
                        style={[
                          styles.daySquare,
                          isIOS ? styles.iosDaySquare : styles.androidDaySquare,
                          {
                            backgroundColor: day.isCompleted ? colors.primary : colors.surface,
                          },
                        ]}
                      />
                    ) : (
                      <View style={styles.emptyDay} />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * History screen.
 * Shows one contribution graph per prayer.
 */
export default function StreakScreen() {
  const { isLoading } = useHabits();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.header}>
          Streak
        </ThemedText>
        {PRAYER_HABITS.map((prayer) => (
          <PrayerContributionGraph key={prayer.id} prayerId={prayer.id} prayerName={prayer.name} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    textAlign: "center",
    marginTop: 64,
    marginBottom: 48,
  },
  graphContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  prayerBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  prayerHeader: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 22,
  },
  graphCardContent: {
    padding: 16,
    width: "100%",
  },
  graphRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  weekdayColumn: {
    marginRight: 4,
    marginLeft: 4,
  },
  weekdayLetter: {
    height: 18,
    textAlign: "center",
    fontSize: 12,
    marginVertical: 3.9,
    marginTop: 0,
  },
  contributionGraph: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
  },
  weekColumn: {
    flexDirection: "column",
    marginHorizontal: 1,
  },
  dayContainer: {
    marginVertical: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  daySquare: {
    width: 16,
    height: 16,
    margin: 2,
  },
  iosDaySquare: {
    borderRadius: 4,
  },
  androidDaySquare: {
    borderRadius: 2,
  },
  emptyDay: {
    width: 22,
    height: 22,
  },
});
