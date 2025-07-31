import React, { useMemo } from "react";
import { StyleSheet, ScrollView, ActivityIndicator, View } from "react-native";
import Checkbox from "expo-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subDays, eachDayOfInterval } from "date-fns";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { PRAYER_HABITS, getDateKey } from "@/constants/Habits";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useHabits } from "@/contexts/HabitContext";

const PrayerContributionGraph = ({ prayerId, prayerName }: { prayerId: string; prayerName: string }) => {
  const { historyData } = useHabits();
  const colorScheme = useColorScheme() ?? "light";
  const themedColors = Colors[colorScheme];

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
    return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => ({
      date: day,
      isCompleted: completedDates.has(getDateKey(day)),
    }));
  }, [completedDates]);

  return (
    <ThemedView style={styles.graphContainer}>
      <ThemedText style={styles.prayerHeader}>{prayerName}</ThemedText>
      <ThemedView style={styles.grid}>
        {last30Days.map((day, index) => (
          <Checkbox
            key={index}
            color={themedColors.tint}
            value={day.isCompleted}
            onValueChange={() => {}} // Read-only
            style={[styles.checkbox]}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
};

export default function StreakScreen() {
  const { isLoading } = useHabits();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const themedColors = Colors[colorScheme];

  if (isLoading) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={themedColors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.listContainer}>
        <ThemedText style={styles.mainHeader}>Last 30 Days</ThemedText>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  listContainer: {
    padding: 25,
    paddingTop: 30,
  },
  mainHeader: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 3,
    marginBottom: 24
  },
  graphContainer: {
    marginBottom: 30
  },
  prayerHeader: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    margin: 2,
    borderWidth: 1.3,
  },
});
