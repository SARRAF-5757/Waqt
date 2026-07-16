import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Adhan from "adhan";

export type PrayerTimesMap = {
  fajr: Date | undefined;
  fajrEnd: Date | undefined;
  dhuhr: Date | undefined;
  dhuhrEnd: Date | undefined;
  asr: Date | undefined;
  asrEnd: Date | undefined;
  maghrib: Date | undefined;
  maghribEnd: Date | undefined;
  isha: Date | undefined;
  ishaEnd: Date | undefined;
};

/**
 * Calculates prayer times for the current day based on GPS coordinates and
 * saved calculation preferences
 */
export async function computeTodayPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimesMap> {
  const coordinates = new Adhan.Coordinates(latitude, longitude);

  const methodStr = (await AsyncStorage.getItem("calculationMethod")) || "MoonsightingCommittee";
  const madhabStr = (await AsyncStorage.getItem("madhab")) || "shafi";

  const params = (Adhan.CalculationMethod as any)[methodStr]();
  params.madhab = madhabStr === "hanafi" ? Adhan.Madhab.Hanafi : Adhan.Madhab.Shafi;

  const now = new Date();
  const prayerTimes = new Adhan.PrayerTimes(coordinates, now, params);
  const sunnahTimes = new Adhan.SunnahTimes(prayerTimes);

  return {
    fajr: prayerTimes.fajr,
    fajrEnd: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    dhuhrEnd: prayerTimes.asr,
    asr: prayerTimes.asr,
    asrEnd: prayerTimes.maghrib,
    maghrib: prayerTimes.maghrib,
    maghribEnd: prayerTimes.isha,
    isha: prayerTimes.isha,
    ishaEnd: sunnahTimes.middleOfTheNight,
  };
}
