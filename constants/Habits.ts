import React, { useState, useEffect } from "react";
import { format, subHours } from "date-fns";
import * as Location from "expo-location";
import * as Adhan from "adhan";

export const PRAYER_HABITS = [
  { id: "fajr", name: "Fajr" },
  { id: "dhuhr", name: "Dhuhr" },
  { id: "asr", name: "Asr" },
  { id: "maghrib", name: "Maghrib" },
  { id: "isha", name: "Isha" },
];

let fajrTime = 0;

// get fajr pryer time
useEffect(() => {
  const getFajrTime = async () => {
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const coordinates = new Adhan.Coordinates(latitude, longitude);
    const params = Adhan.CalculationMethod.MoonsightingCommittee();
    const date = new Date();

    const prayerTimes = new Adhan.PrayerTimes(coordinates, date, params);
    fajrTime = parseInt(format(prayerTimes.fajr, "hh"));
  };
  getFajrTime();
}, []);

// storage / context key
// Note: Day changes at fajr now
// This allows users to edit the previous day until fajr
export const getDateKey = (d = new Date()) => {
  const shifted = subHours(d, fajrTime);
  return format(shifted, "yyyy-MM-dd");
};
