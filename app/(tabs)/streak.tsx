import React, { useMemo } from "react";
import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subDays, eachDayOfInterval } from "date-fns";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { PRAYER_HABITS, getDateKey } from "@/constants/Habits";
import { useThemeColors } from '@/hooks/useThemeColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useHabits } from "@/providers/habitProvider";


// render a single prayer's contribution graph
const PrayerContributionGraph = ({ prayerId, prayerName }: { prayerId: string; prayerName: string }) => {
  const { historyData } = useHabits();
  const colors = useThemeColors();
  const colorScheme = useColorScheme() ?? 'light';

  // Find all dates where this prayer was completed
  const completedDates = useMemo(() => {
    const dates = new Set<string>();
    historyData.forEach((item) => {
      if (item.statuses[prayerId]) {
        dates.add(item.date);
      }
    });
    return dates;
  }, [historyData, prayerId]);

  const last30Days = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map((day) => ({
        date: day,
        isCompleted: completedDates.has(getDateKey(day)),
      }))
      .reverse(); //remove this to make it chronological
  }, [completedDates]);

  return (
    <ThemedView style={styles.graphContainer}>
      <ThemedView
        style={styles.prayerBox}
        lightColor={colors.surfaceVariant}
        darkColor={colors.surfaceVariant}
      >
        <ThemedText style={styles.prayerHeader}>{prayerName}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.grid}>
        {last30Days.map((day, index) => (
          <Checkbox
            key={index}
            color={
              day.isCompleted
                ? colors.primary
                : colorScheme === 'light'
                  ? colors.surfaceDim
                  : colors.surfaceBright
            }
            value={day.isCompleted}
            onValueChange={() => {}} // Read-only
            style={[styles.checkbox]}
          />
        ))}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    margin: 2,
    borderWidth: 1.3,
  },
});
