import React, { useEffect } from "react";
import { StyleSheet, ScrollView, useColorScheme, Image, AppState, View, Pressable, Platform } from "react-native";
import Checkbox from "expo-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { PRAYER_HABITS } from "@/constants/Habits";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabits } from "@/providers/habitProvider";
import { usePrayerTimes } from "@/providers/prayerTimesProvider";
import { configureNotificationHandler, setupPrayerNotifications } from "@/services/notifications";
import { getDateKey } from "@/utils/dateKey";
import { getStatusesForDate } from "@/utils/habits";

// Set up notification display rules once when this file loads
configureNotificationHandler();

/**
 * Home screen
 * Shows today's five prayers with checkboxes and calculated prayer times
 */
export default function HomeScreen() {
  //* ----------------------------- JS ----------------------------- *//

  const { historyData, updateHabitStatus } = useHabits();
  const { times } = usePrayerTimes();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const todayKey = getDateKey();
  const todayStatuses = getStatusesForDate(historyData, todayKey);
  const isIOS = Platform.OS === "ios";

  /**
   * Automatically schedule notifications and re-schedule them
   * whenever the app comes back to the foreground.
   */
  useEffect(() => {
    setupPrayerNotifications();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setupPrayerNotifications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Toggles the completion status of a prayer for today.
   * @param prayerId - The unique ID of the prayer (e.g. "fajr")
   */
  const handleTogglePrayer = (prayerId: string) => {
    const newValue = !todayStatuses[prayerId];
    updateHabitStatus(todayKey, prayerId, newValue);
  };

  const logoSource = colorScheme === "dark" ? require("@/assets/images/icons/splash-icon-light.png") : require("@/assets/images/icons/splash-icon-dark.png");

  //* --------------------------- RETURN --------------------------- *//
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={[styles.headerContainer, isIOS ? { paddingTop: insets.top + 10 } : undefined]}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Loop through and render all prayers */}
        {PRAYER_HABITS.map((habit) => {
          const isCompleted = todayStatuses[habit.id] || false;
          const prayerTime = times[habit.id as keyof typeof times];
          const endKey = `${habit.id}End` as keyof typeof times;
          const endTime = times[endKey];

          const formatTimeStr = (date?: Date) => {
            if (!date) return "--:--";
            const str = format(date, "h:mm a");
            return str.length < 8 ? "\u2007" + str : str; // Pad with a space so single digit hours visually align with double digit hours
          };

          const startTimeLabel = formatTimeStr(prayerTime);
          const endTimeLabel = formatTimeStr(endTime);

          return (
            <Pressable
              key={habit.id}
              onPress={() => handleTogglePrayer(habit.id)}
              style={({ pressed }) => [
                styles.prayerCard,
                {
                  backgroundColor: isCompleted ? colors.primaryContainer : colors.surfaceDim || colors.surfaceVariant,
                  opacity: pressed ? 0.8 : 1,
                  borderRadius: isIOS ? 20 : 12,
                },
                !isIOS && { elevation: 2 },
              ]}
            >
              <View style={styles.habitRow}>
                <Checkbox
                  color={isCompleted ? colors.primary : colors.onSurfaceVariant}
                  value={isCompleted}
                  onValueChange={() => handleTogglePrayer(habit.id)}
                  style={styles.checkbox}
                />
                <ThemedText style={[styles.habitName, { color: isCompleted ? colors.onPrimaryContainer : colors.onSurface }]}>{habit.name}</ThemedText>
                <View style={styles.timesWrapper}>
                  <View style={[styles.timeContainer, { backgroundColor: colors.surface }]}>
                    <ThemedText style={[styles.habitTime, { color: colors.onSurface }]}>{startTimeLabel}</ThemedText>
                  </View>
                  <ThemedText style={[styles.timeDash, { color: colors.onSurface }]}>—</ThemedText>
                  <View style={[styles.timeContainer, { backgroundColor: colors.surface }]}>
                    <ThemedText style={[styles.habitTime, { color: colors.onSurface }]}>{endTimeLabel}</ThemedText>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
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
  headerContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 36,
  },
  logo: {
    width: 180,
    height: 180,
  },
  prayerCard: {
    marginBottom: 16,
    overflow: "hidden",
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 9,
  },
  habitName: {
    marginLeft: 16,
    fontSize: 18,
    flex: 1,
  },
  timesWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeDash: {
    marginHorizontal: 5,
    fontSize: 15,
    fontWeight: "900",
  },
  timeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitTime: {
    fontSize: 15,
    fontWeight: "600",
  },
});
