// import * as Notifications from "expo-notifications";
let Notifications: any;
try {
  Notifications = require("expo-notifications");
} catch (e) {
  console.warn("expo-notifications not available in this environment.");
}
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Adhan from "adhan";
import { getDateKey } from "@/utils/dateKey";

//* ----------------------------- JS ----------------------------- *//

/**
 * Configures how the app displays notifications when it is in the foreground.
 */
export function configureNotificationHandler() {
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Mutex lock to prevent concurrent executions of setupPrayerNotifications.
 * This avoids duplicate notifications from being scheduled during app startup
 * when both useEffect and AppState transitions may trigger it simultaneously.
 */
let isScheduling = false;
/**
 * Flag to ensure that if the user toggles a prayer while notifications
 * are currently being scheduled, the function will run again to capture the new state.
 */
let needsReschedule = false;

/**
 * Schedules notifications for the next 10 days based on calculated prayer times
 * and user preferences (like calculation method and warning offset).
 */
export const setupPrayerNotifications = async () => {
  if (isScheduling) {
    needsReschedule = true;
    return;
  }
  isScheduling = true;

  try {
    let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (!Notifications) return;
    let { status: notifStatus } = await Notifications.requestPermissionsAsync();

    if (locationStatus !== "granted" || notifStatus !== "granted") {
      console.error("Couldn't get permissions");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const coordinates = new Adhan.Coordinates(latitude, longitude);

    const methodStr = (await AsyncStorage.getItem("calculationMethod")) || "MoonsightingCommittee";
    const madhabStr = (await AsyncStorage.getItem("madhab")) || "shafi";

    const params = (Adhan.CalculationMethod as any)[methodStr]();
    params.madhab = madhabStr === "hanafi" ? Adhan.Madhab.Hanafi : Adhan.Madhab.Shafi;

    // Create the notification channel required for Android
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.cancelAllScheduledNotificationsAsync();

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

    for (let i = 0; i < 10; i++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + i);

      const dateKey = getDateKey(targetDate);
      const statusesStr = await AsyncStorage.getItem(dateKey);
      const statuses = statusesStr ? JSON.parse(statusesStr) : {};

      const prayerTimes = new Adhan.PrayerTimes(coordinates, targetDate, params);
      const sunnahTimes = new Adhan.SunnahTimes(prayerTimes);

      for (const key of prayerKeys) {
        // Skip scheduling both start and end notifications if the prayer is already completed for the day
        if (statuses[key]) {
          continue;
        }

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
  } finally {
    isScheduling = false;
    if (needsReschedule) {
      needsReschedule = false;
      setupPrayerNotifications();
    }
  }
};
