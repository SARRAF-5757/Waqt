import React, { useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
  AppState,
  View,
  Pressable,
  Platform,
} from "react-native";
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

// Set up notification display rules once when this file loads.
configureNotificationHandler();

/**
 * Home screen.
 * Shows today's five prayers with checkboxes and calculated prayer times.
 */
export default function HomeScreen() {
  const { historyData, updateHabitStatus } = useHabits();
  const { times } = usePrayerTimes();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const todayKey = getDateKey();
  const todayStatuses = getStatusesForDate(historyData, todayKey);

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

  const handleTogglePrayer = (prayerId: string) => {
    const newValue = !todayStatuses[prayerId];
    updateHabitStatus(todayKey, prayerId, newValue);
  };

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/icons/splash-icon-light.png")
      : require("@/assets/images/icons/splash-icon-dark.png");

  const isIOS = Platform.OS === 'ios';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>

        {PRAYER_HABITS.map((habit) => {
          const isCompleted = todayStatuses[habit.id] || false;
          const prayerTime = times[habit.id as keyof typeof times];
          const timeLabel = prayerTime ? format(prayerTime, "h:mm aa ") : "--:-- ";

          return (
            <Pressable
              key={habit.id}
              onPress={() => handleTogglePrayer(habit.id)}
              style={({ pressed }) => [
                styles.prayerCard,
                {
                  backgroundColor: isCompleted 
                    ? colors.primaryContainer 
                    : colors.surfaceDim || colors.surfaceVariant,
                  opacity: pressed ? 0.8 : 1,
                  borderRadius: isIOS ? 20 : 12,
                },
                !isIOS && { elevation: 2 }
              ]}
            >
              <View style={styles.habitRow}>
                <Checkbox
                  color={isCompleted ? colors.primary : colors.onSurfaceVariant}
                  value={isCompleted}
                  onValueChange={() => handleTogglePrayer(habit.id)}
                  style={styles.checkbox}
                />
                <ThemedText style={[styles.habitName, { color: isCompleted ? colors.onPrimaryContainer : colors.onSurface }]}>
                  {habit.name}
                </ThemedText>
                <View
                  style={[
                    styles.timeContainer,
                    {
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.habitTime,
                      { color: colors.onSurface },
                    ]}
                  >
                    {timeLabel}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          );
        })}
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
  headerContainer: {
    alignItems: "center",
    marginTop: 64,
    marginBottom: 48,
  },
  logo: {
    width: 180,
    height: 180,
  },
  prayerCard: {
    marginBottom: 16,
    overflow: 'hidden',
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
  timeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  habitTime: {
    fontSize: 16,
    fontWeight: "600",
  },
});
