import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subDays, subHours } from "date-fns";

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

  // Generate however many consecutive date keys going backward from today
  const filledDays = [];
  const now = new Date();

  for (let daysBack = 104; daysBack >= 0; daysBack--) {
    // Calculate the actual calendar date for this many days back
    const calendarDate = subDays(now, daysBack);
    const dateKey = getDateKey(calendarDate);
    
    // shift date by 4 hours to display correctly
    const shiftedDate = subHours(calendarDate, 4);
    
    filledDays.push({
      date: shiftedDate,
      isCompleted: completedDatesSet.has(dateKey),  // check if this date is in the completed set
      dateKey: dateKey,
    });
  }  
  
  // Find the first Sunday to start our grid from
  let firstSunday;
  for (let i = 0; i < filledDays.length; i++) {
    if (filledDays[i].date.getDay() === 0) { // Sunday = 0
      firstSunday = i;
      break;
    }
  }
  // If no Sunday found, start from beginning
  if (firstSunday === undefined) {
    firstSunday = 0;
  }
  
  // Group days into weeks (columns)
  const weeks = [];                             // empty array to be filled with week arrays
  let currentWeek = [];                         // current week array to be filled with day objects
  
  for (let i = firstSunday; i < filledDays.length; i++) {
    const day = filledDays[i];
    currentWeek.push(day);
    
    // push into weeks array when 7 days are added
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // if there's an incomplete week at the end, fill remaining days with empty slots
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
    marginBottom: 25,
    alignItems: 'center',
  },
  prayerBox: {
    paddingTop: 10,
    borderRadius: 20,
    marginBottom:15,
    width: '90%',
  },
  prayerHeader: {
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 22,
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
  },
});
