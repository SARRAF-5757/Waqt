import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import Checkbox from "expo-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as Adhan from "adhan";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PRAYER_HABITS, getDateKey } from "@/constants/Habits";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabits } from "@/providers/habitProvider";
import { usePrayerTimes } from "@/providers/prayerTimesProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Index() {
  const { historyData, updateHabitStatus } = useHabits(); // get habit data and update function from context
  const todayKey = getDateKey(); // get today's date key
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  let todayStatuses: Record<string, boolean> = {};
  const [prayerStatuses, setPrayerStatuses] = useState<Record<string, boolean>>(todayStatuses); // Local state for prayer checkboxes (for instant UI feedback)
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const { times } = usePrayerTimes();

  // Find today's prayer completion statuses from context data
  for (let i = 0; i < historyData.length; i++) {
    const habitEntry = historyData[i];
    if (habitEntry.date === todayKey && habitEntry.statuses) {
      // for each entry in the history data, if the date matches today and has prayer statuses
      todayStatuses = habitEntry.statuses; // set today's statuses to that entry's statuses
      break;
    }
  }

  // Schedule prayer notifications
  useEffect(() => {
    const setupPrayerNotifs = async () => {
      try {
        // wait for permissions
        let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        const { status: notifStatus } = await Notifications.getPermissionsAsync();

        if (locationStatus != "granted" || notifStatus != "granted") {
          console.error("Couldn't get permissions");
        }

        // get prayer times
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const coordinates = new Adhan.Coordinates(latitude, longitude);
        const params = Adhan.CalculationMethod.MoonsightingCommittee();
        const date = new Date();

        const prayerTimes = new Adhan.PrayerTimes(coordinates, date, params);

        // Platform specific things
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
          });
        } else if (Platform.OS === "ios") {
          // TODO: Implement ios notifications
        }

        // schedule notifications
        await Notifications.cancelAllScheduledNotificationsAsync(); //cancel old notifs

        const formatTime = (date: Date) => {
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "It's time for Fajr",
            body: "",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayerTimes.fajr,
          },
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "It's time for Dhuhr",
            body: "",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayerTimes.dhuhr,
          },
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "It's time for Asr",
            body: "",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayerTimes.asr,
          },
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "It's time for Maghrib",
            body: "",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayerTimes.maghrib,
          },
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "It's time for Isha",
            body: "",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayerTimes.isha,
          },
        });
      } catch (error) {
        console.error("Failed to Schedule Notifications", error);
      }
    };
    setupPrayerNotifs();
  }, []);

  // Sync local state with context data if date changes or completion statuses change
  useEffect(() => {
    setPrayerStatuses(todayStatuses);
  }, [todayKey, JSON.stringify(todayStatuses)]);

  //# On prayer checkbox press
  const handleTogglePrayer = (id: string) => {
    const newVal = !prayerStatuses[id]; // flip the status for the given prayer id
    setPrayerStatuses((s) => ({ ...s, [id]: newVal })); // update local state (for UI refresh)
    updateHabitStatus(todayKey, id, newVal); // update context data
  };

  //* Build list of prayers to render
  const prayerHabitRows = [];

  for (let i = 0; i < PRAYER_HABITS.length; ++i) {
    const habit = PRAYER_HABITS[i];
    const timeDate = times[habit.id];
    const timeStr = timeDate ? format(timeDate, "h:mm a") : "";

    prayerHabitRows.push(
      <TouchableOpacity key={habit.id} onPress={() => handleTogglePrayer(habit.id)} activeOpacity={0.5} style={styles.touchableRow}>
        <ThemedView
          lightColor={prayerStatuses[habit.id] || false ? colors.surfaceVariant : colors.surfaceDim}
          darkColor={prayerStatuses[habit.id] || false ? colors.surfaceVariant : colors.surfaceBright}
          style={styles.habitRow}
        >
          <Checkbox
            color={prayerStatuses[habit.id] || false ? colors.primary : colors.onSurfaceVariant}
            value={prayerStatuses[habit.id] || false}
            onValueChange={() => handleTogglePrayer(habit.id)}
            style={[styles.checkbox]}
          />
          <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
          <ThemedView style={styles.timeContainer} lightColor={colors.surfaceVariant} darkColor={colors.surfaceVariant}>
            <ThemedText style={styles.habitTime}>{timeStr}</ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>,
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText style={[styles.header, { paddingTop: insets.top + 6 }]}>Waqt</ThemedText>
        {prayerHabitRows}
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
  touchableRow: {
    marginBottom: 20,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
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
    borderRadius: 25,
  },
  habitTime: {
    marginLeft: 25,
    fontSize: 16,
  },
});
