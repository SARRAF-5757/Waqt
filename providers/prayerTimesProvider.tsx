import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import * as Adhan from 'adhan';

type TimesMap = Record<string, Date | undefined>;

const PrayerTimesContext = createContext<{ times: TimesMap; reload: () => Promise<void> } | undefined>(undefined);

export const PrayerTimesProvider = ({ children }: { children: React.ReactNode }) => {
  const [times, setTimes] = useState<TimesMap>({});

  const computeTimes = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const coords = new Adhan.Coordinates(loc.coords.latitude, loc.coords.longitude);
      const params = Adhan.CalculationMethod.MoonsightingCommittee();
      const prayerTimes = new Adhan.PrayerTimes(coords, new Date(), params);

      setTimes({
        fajr: prayerTimes.fajr,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
      });

    } catch (e) {
      console.error('Failed to get prayer times', e);
    }
  };

  useEffect(() => {
    computeTimes();
  }, []);

  return <PrayerTimesContext.Provider value={{ times, reload: computeTimes }}>{children}</PrayerTimesContext.Provider>;
};

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (!context) throw new Error('usePrayerTimes must be used inside PrayerTimesProvider');
  return context;
};
