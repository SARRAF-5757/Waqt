import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ScrollView, Platform, useColorScheme, Image, AppState } from "react-native";
import Checkbox from "expo-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as Adhan from "adhan";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const { times } = usePrayerTimes();
  const colorScheme = useColorScheme();

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
  const setupPrayerNotifs = async () => {
    try {
      // wait for permissions
      let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      let { status: notifStatus } = await Notifications.requestPermissionsAsync();

      if (locationStatus !== "granted" || notifStatus !== "granted") {
        console.error("Couldn't get permissions");
        return;
      }

      // get prayer times
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const coordinates = new Adhan.Coordinates(latitude, longitude);
      const params = Adhan.CalculationMethod.MoonsightingCommittee();

      // Platform specific things
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      // schedule notifications
      await Notifications.cancelAllScheduledNotificationsAsync(); //cancel old notifs

      const prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
      const prayerNames = {
        fajr: "Fajr",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
      };

      const now = new Date();
      const offsetStr = await AsyncStorage.getItem("endTimeOffset");
      const offsetMinutes = offsetStr ? parseInt(offsetStr, 10) : 15;

      // Schedule notifications for the next 10 days to handle prolonged offline usage
      for (let i = 0; i < 10; i++) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + i);

        const prayerTimes = new Adhan.PrayerTimes(coordinates, targetDate, params);
        const sunnahTimes = new Adhan.SunnahTimes(prayerTimes);

        for (const key of prayerKeys) {
          const time = prayerTimes[key];
          if (time && time > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `It's time for ${prayerNames[key]}`,
                body: "",
                sound: true,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: time,
              },
            });
          }

          let endTime: Date | null = null;
          if (key === "fajr") {
            endTime = prayerTimes.sunrise;
          } else if (key === "dhuhr") {
            endTime = prayerTimes.asr;
          } else if (key === "asr") {
            endTime = prayerTimes.maghrib;
          } else if (key === "maghrib") {
            endTime = prayerTimes.isha;
          } else if (key === "isha") {
            endTime = sunnahTimes.middleOfTheNight;
          }

          if (endTime) {
            const notificationTime = new Date(endTime.getTime() - offsetMinutes * 60000);
            if (notificationTime > now) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `${prayerNames[key]} time is ending in ${offsetMinutes} minutes`,
                  body: "",
                  sound: true,
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: notificationTime,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to Schedule Notifications", error);
    }
  };

  // Schedule notifications initially and on app foreground transition
  useEffect(() => {
    setupPrayerNotifs();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setupPrayerNotifs();
      }
    });

    return () => {
      subscription.remove();
    };
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
    const timeStr = timeDate ? format(timeDate, "h:mm aa ") : "--:-- ";

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
        <ThemedView style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
          <Image
            source={colorScheme === "dark" ? require("@/assets/images/icons/splash-icon-light.png") : require("@/assets/images/icons/splash-icon-dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </ThemedView>
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  habitTime: {
    fontSize: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 180,
    height: 180,
  },
});
