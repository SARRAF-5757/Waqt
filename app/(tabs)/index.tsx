import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, ScrollView, useColorScheme, Image, AppState, View, Pressable } from "react-native";
import { Host } from "@expo/ui";
import { Checkbox as JetpackCheckbox } from "@expo/ui/jetpack-compose";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { PRAYER_HABITS } from "@/constants/Habits";
import { STORAGE_KEYS } from "@/constants/Settings";
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
  // Settings for controlling which prayer times are visually rendered
  const [showStartTime, setShowStartTime] = useState<boolean>(true);
  const [showEndTime, setShowEndTime] = useState<boolean>(true);

  /**
   * Re-fetches the user's display preferences each time the tab comes into focus.
   */
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEYS.showStartTime).then((value) => {
        if (value !== null) setShowStartTime(value === "true");
      });
      AsyncStorage.getItem(STORAGE_KEYS.showEndTime).then((value) => {
        if (value !== null) setShowEndTime(value === "true");
      });
    }, []),
  );

  const { historyData, updateHabitStatus } = useHabits();
  const { times } = usePrayerTimes();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const todayKey = getDateKey();
  const todayStatuses = getStatusesForDate(historyData, todayKey);

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
   * Re-runs setupPrayerNotifications so any newly completed prayers
   * get their scheduled reminders immediately cancelled.
   * @param prayerId - The unique ID of the prayer (e.g. "fajr")
   */
  const handleTogglePrayer = async (prayerId: string) => {
    const newValue = !todayStatuses[prayerId];
    await updateHabitStatus(todayKey, prayerId, newValue);
    setupPrayerNotifications();
  };

  const logoSource = colorScheme === "dark" ? require("@/assets/images/icons/splash-icon-light.png") : require("@/assets/images/icons/splash-icon-dark.png");

  //* --------------------------- RETURN --------------------------- *//
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header containing the app logo */}
        <View style={styles.headerContainer}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Loop through and render all prayers */}
        {PRAYER_HABITS.map((habit) => {
          const isCompleted = todayStatuses[habit.id] || false;
          const prayerTime = times[habit.id as keyof typeof times];
          const endKey = `${habit.id}End` as keyof typeof times;
          const endTime = times[endKey];

          /**
           * Formats a given Date to "h:mm a" but ensures perfect visual alignment.
           */
          const formatTimeStr = (date?: Date) => {
            if (!date) return "--:--";
            const str = format(date, "h:mm a");
            return str.length < 8 ? "\u2007" + str : str;
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
                  backgroundColor: isCompleted ? colors.primaryContainer : colors.surfaceContainer,
                  opacity: pressed ? 0.8 : 1,
                  borderRadius: 12,
                  elevation: 2,
                },
              ]}
            >
              <View style={styles.habitRow}>
                {/* 
                  Native Android Jetpack Compose Checkbox. 
                  Wrapped in Host with matchContents to allow Compose view to size correctly.
                  Negative margin offsets the built-in 48x48dp minimum touch target spacing in Compose.
                */}
                <View style={{ marginHorizontal: -12 }}>
                  <Host matchContents>
                    <JetpackCheckbox
                      value={isCompleted}
                      onCheckedChange={() => handleTogglePrayer(habit.id)}
                      colors={{
                        checkedColor: colors.primary,
                        uncheckedColor: colors.onSurfaceVariant,
                      }}
                    />
                  </Host>
                </View>
                <ThemedText style={[styles.habitName, { color: isCompleted ? colors.onPrimaryContainer : colors.onSurface }]}>{habit.name}</ThemedText>
                <View style={styles.timesWrapper}>
                  {showStartTime && (
                    <View style={[styles.timeContainer, { backgroundColor: colors.surface }]}>
                      <ThemedText style={[styles.habitTime, { color: colors.onSurface }]}>{startTimeLabel}</ThemedText>
                    </View>
                  )}
                  {showStartTime && showEndTime && <ThemedText style={[styles.timeDash, { color: colors.onSurface }]}>—</ThemedText>}
                  {showEndTime && (
                    <View style={[styles.timeContainer, { backgroundColor: colors.surface }]}>
                      <ThemedText style={[styles.habitTime, { color: colors.onSurface }]}>{endTimeLabel}</ThemedText>
                    </View>
                  )}
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
    paddingVertical: 8,
    paddingHorizontal: 16,
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
