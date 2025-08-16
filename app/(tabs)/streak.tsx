import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subDays, eachDayOfInterval } from "date-fns";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { PRAYER_HABITS, getDateKey } from "@/constants/Habits";
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHabits } from "@/providers/habitProvider";


// For each prayer's contribution graph
const PrayerContributionGraph = ({ prayerId, prayerName }: { prayerId: string; prayerName: string }) => {
  const { historyData } = useHabits();
  const colors = useThemeColors();

  // Find all dates where this prayer was completed
  const completedDatesSet = new Set<string>();

  for (let i = 0; i < historyData.length; ++i) {
    const item = historyData[i];
    if (item.statuses[prayerId]) {
      completedDatesSet.add(item.date);
    }
  }

  // Build last however many days array
  const filledDays = [];                        // array of days to be filled with checked/unchecked status
  const endDate = new Date();
  const startDate = subDays(endDate, 104);      //# subtract how many days back to show
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });  // empty array of all days in the interval to be modified and pushed to filledDays

  for (let i = 0; i < allDays.length; ++i) {
    const day = allDays[i];
    const dateKey = getDateKey(day);
    filledDays.push({
      date: day,
      isCompleted: completedDatesSet.has(dateKey),  // check if this date is in the completed set
      dateKey: dateKey,
    });
  }

  // Group days into weeks (columns)
  const weeks = [];                             // empty array to be filled with week arrays
  let currentWeek = [];                         // current week array to be filled with day objects

  for (let i = 0; i < filledDays.length; ++i) {
    const day = filledDays[i];
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // If the last week is not full, fill with empty days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(0),
        isCompleted: false,
        dateKey: '',
      });
    }
    weeks.push(currentWeek);
  }


  // Letters for days of the week
  const weekDayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <ThemedView style={styles.graphContainer}>
      {/* Prayer title */}
      <ThemedView
        style={styles.prayerBox}
        lightColor={colors.surfaceVariant}
        darkColor={colors.surfaceVariant}
      >
        <ThemedText style={styles.prayerHeader}>{prayerName}</ThemedText>
      </ThemedView>

      {/* Contribution graph */}
      <ThemedView style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Weekday letters column */}
          <ThemedView style={{ marginRight: 1, marginLeft: 7 }}>
            {weekDayLetters.map((letter, idx) => (
              <ThemedText key={idx} style={{ height: 18, textAlign: 'center', fontSize: 12, marginVertical: 3.9, marginTop: 0 }}>{letter}</ThemedText>
            ))}
          </ThemedView>
          {/* Streak grid */}
          <ThemedView style={styles.contributionGraph}>
            {weeks.map((week, weekIndex) => (
              <ThemedView key={weekIndex} style={styles.weekColumn}>
                {week.map((day, dayIndex) => (
                  <ThemedView key={dayIndex} style={styles.dayContainer}>
                    {day.dateKey ? (
                      <ThemedView
                        style={{
                          width: 16,
                          height: 16,
                          margin: 2,
                          backgroundColor: day.isCompleted ? colors.primary : colors.surfaceVariant,
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <ThemedView style={styles.emptyDay} />
                    )}
                  </ThemedView>
                ))}
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};


// streak screen
export default function StreakScreen() {
  const { isLoading } = useHabits();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <ThemedView style={[{ paddingTop: insets.top }]}>
        <ActivityIndicator/>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.header}>Streak</ThemedText>
        {PRAYER_HABITS.map((prayer) => (
          <PrayerContributionGraph key={prayer.id} prayerId={prayer.id} prayerName={prayer.name} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    paddingVertical: 6,
  },
  graphContainer: {
    marginBottom: 20
  },
  prayerBox: {
    alignItems: 'center',
    paddingTop: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  prayerHeader: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  contributionGraph: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10,
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
  emptyDay: {
    width: 22,
    height: 22,
  }
});
