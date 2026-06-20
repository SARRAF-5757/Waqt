import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Adhan from "adhan";

export type PrayerTimesMap = {
  fajr: Date | undefined;
  dhuhr: Date | undefined;
  asr: Date | undefined;
  maghrib: Date | undefined;
  isha: Date | undefined;
};

export async function computeTodayPrayerTimes(
  latitude: number,
  longitude: number
): Promise<PrayerTimesMap> {
  const coordinates = new Adhan.Coordinates(latitude, longitude);

  const methodStr = (await AsyncStorage.getItem("calculationMethod")) || "MoonsightingCommittee";
  const madhabStr = (await AsyncStorage.getItem("madhab")) || "shafi";

  const params = (Adhan.CalculationMethod as any)[methodStr]();
  params.madhab = madhabStr === "hanafi" ? Adhan.Madhab.Hanafi : Adhan.Madhab.Shafi;

  const now = new Date();
  const prayerTimes = new Adhan.PrayerTimes(coordinates, now, params);

  return {
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };
}
