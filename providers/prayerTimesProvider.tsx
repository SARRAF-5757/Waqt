import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

import { computeTodayPrayerTimes, PrayerTimesMap } from "@/utils/prayerTimes";
import { setFajrCutoff } from "@/utils/dateKey";

type PrayerTimesContextValue = {
  times: PrayerTimesMap;
  reload: () => Promise<void>;
};

const PrayerTimesContext = createContext<PrayerTimesContextValue | undefined>(undefined);

/**
 * Fetches today's prayer times from the device location and shares them
 * with any screen that needs to display prayer times
 */
export function PrayerTimesProvider({ children }: { children: React.ReactNode }) {
  //* ----------------------------- JS ----------------------------- *//
  const [times, setTimes] = useState<PrayerTimesMap>({
    fajr: undefined,
    fajrEnd: undefined,
    dhuhr: undefined,
    dhuhrEnd: undefined,
    asr: undefined,
    asrEnd: undefined,
    maghrib: undefined,
    maghribEnd: undefined,
    isha: undefined,
    ishaEnd: undefined,
  });

  /**
   * Requests GPS permissions, gets the current location, and computes
   * today's prayer times based on user preferences
   */
  const reload = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const prayerTimes = await computeTodayPrayerTimes(location.coords.latitude, location.coords.longitude);

      // Synchronize the daily habit time cutoff to match Fajr time instead of midnight
      setFajrCutoff(prayerTimes.fajr);
      setTimes(prayerTimes);
    } catch (error) {
      console.error("Failed to get prayer times", error);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  //* --------------------------- RETURN --------------------------- *//
  // Share prayer times with child components
  return <PrayerTimesContext.Provider value={{ times, reload }}>{children}</PrayerTimesContext.Provider>;
}

/**
 * Hook to easily access the prayer times context
 * Must be used within a PrayerTimesProvider
 */
export function usePrayerTimes() {
  const context = useContext(PrayerTimesContext);
  if (!context) {
    throw new Error("usePrayerTimes must be used inside PrayerTimesProvider");
  }
  return context;
}
