import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Adhan from "adhan";

//* ----------------------------- JS ----------------------------- *//

/**
 * Configures how the app displays notifications when it is in the foreground.
 */
export function configureNotificationHandler() {
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
 * Schedules notifications for the next 10 days based on calculated prayer times
 * and user preferences (like calculation method and warning offset).
 */
export const setupPrayerNotifications = async () => {
    try {
      let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      let { status: notifStatus } = await Notifications.requestPermissionsAsync();

      if (locationStatus !== "granted" || notifStatus !== "granted") {
        console.error("Couldn't get permissions");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const coordinates = new Adhan.Coordinates(latitude, longitude);
      
      const methodStr = await AsyncStorage.getItem("calculationMethod") || "MoonsightingCommittee";
      const madhabStr = await AsyncStorage.getItem("madhab") || "shafi";
      
      const params = (Adhan.CalculationMethod as any)[methodStr]();
      params.madhab = madhabStr === "hanafi" ? Adhan.Madhab.Hanafi : Adhan.Madhab.Shafi;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

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
