import React from "react";
import { StyleSheet, ScrollView, ActivityIndicator, View } from "react-native";
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
 * GitHub-style contribution grid for one prayer
 *! Shows a grid of squares representing the last x number of days
 */
function PrayerContributionGraph({ prayerId, prayerName }: PrayerContributionGraphProps) {
  //* ----------------------------- JS ----------------------------- *//
  const { historyData } = useHabits();
  const colors = useThemeColors();

  /**
   * Collect every date where this specific prayer was marked complete.
   * This builds a Set of dates so we can quickly check if a day was completed.
   */
  const completedDates = new Set<string>();
  for (let i = 0; i < historyData.length; i++) {
    const entry = historyData[i];
    if (entry.statuses[prayerId]) {
      completedDates.add(entry.date);
    }
  }

  /**
   * Build one cell per day for the last 105 days.
   * We shift the date by 4 hours so the weekday labels line up visually.
   */
  const dayCells: DayCell[] = [];
  const now = new Date();

  for (let daysBack = DAYS_TO_SHOW - 1; daysBack >= 0; daysBack--) {
    const calendarDate = subDays(now, daysBack);
    const dateKey = getDateKey(calendarDate);

    const shiftedDate = subHours(calendarDate, 4);

    dayCells.push({
      date: shiftedDate,
      dateKey,
      isCompleted: completedDates.has(dateKey),
    });
  }

  /**
   * Find the first Sunday in our list of days,
   * so that our week columns always start on a Sunday.
   */
  let firstSundayIndex = 0;
  for (let i = 0; i < dayCells.length; i++) {
    if (dayCells[i].date.getDay() === 0) {
      firstSundayIndex = i;
      break;
    }
  }

  /**
   * Split the linear list of days into chunks of 7 (weeks).
   * This allows us to map through columns and then rows in the grid.
   */
  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  for (let i = firstSundayIndex; i < dayCells.length; i++) {
    currentWeek.push(dayCells[i]);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad the final partial week with blank placeholders to keep the grid aligned.
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

  //* --------------------------- RETURN --------------------------- *//
  return (
    <View style={styles.prayerBox}>
      <View style={[styles.graphCardContent, { backgroundColor: colors.surfaceContainer, borderRadius: 12 }]}>
        <ThemedText style={styles.prayerHeader}>{prayerName}</ThemedText>
        {/* render row by row */}
        <View style={styles.graphRow}>
          {/* weekday indicator letter */}
          <View style={styles.weekdayColumn}>
            {WEEKDAY_LETTERS.map((letter, index) => (
              <View key={index} style={styles.weekdayLetterContainer}>
                <ThemedText style={[styles.weekdayLetter, { color: colors.onSurfaceVariant }]}>{letter}</ThemedText>
              </View>
            ))}
          </View>

          {/* row associated with the day */}
          <View style={styles.contributionGraph}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekColumn}>
                {week.map((day, dayIndex) => (
                  <View key={dayIndex} style={styles.dayContainer}>
                    {day.dateKey ? (
                      <View
                        style={[
                          styles.daySquare,
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
 * History screen
 *! Shows one contribution graph per prayer
 */
export default function StreakScreen() {
  //* ----------------------------- JS ----------------------------- *//
  const { isLoading } = useHabits();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  //* --------------------------- RETURN --------------------------- *//
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
        {/* Screen title */}
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

//* --------------------------- STYLING --------------------------- *//
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
    marginTop: 18,
    marginBottom: 42,
  },
  prayerBox: {
    marginBottom: 20,
    alignItems: "center",
  },
  prayerHeader: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 22,
    paddingBottom: 16,
  },
  graphCardContent: {
    padding: 16,
  },
  graphRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  weekdayColumn: {
    marginRight: 8,
    marginTop: -3,
  },
  weekdayLetterContainer: {
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  weekdayLetter: {
    fontSize: 11,
  },
  contributionGraph: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    borderRadius: 4,
  },
  emptyDay: {
    width: 20,
    height: 20,
  },
});
