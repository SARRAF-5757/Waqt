import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getDateKey } from "@/utils/dateKey";
import { getStatusesForDate, HabitHistoryItem } from "@/utils/habits";

export type { HabitHistoryItem };

type HabitContextValue = {
  historyData: HabitHistoryItem[];
  isLoading: boolean;
  updateHabitStatus: (date: string, prayerId: string, completed: boolean) => Promise<void>;
  reloadData: () => Promise<void>;
};

const HabitContext = createContext<HabitContextValue | undefined>(undefined);
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Loads prayer completion history from AsyncStorage and shares it with the app
 * Any screen can read historyData or call updateHabitStatus()
 */
export function HabitProvider({ children }: { children: React.ReactNode }) {
  //* ----------------------------- JS ----------------------------- *//
  const [historyData, setHistoryData] = useState<HabitHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Loads history from storage, migrating legacy keys if necessary
   */
  const loadHistoryData = async () => {
    setIsLoading(true);

    try {
      await migrateLegacyStorageKeys();
      const loadedHistory = await readHistoryFromStorage();
      setHistoryData(loadedHistory);
    } catch (error) {
      console.error("Failed to load habit history", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  /**
   * Updates the completion status of a specific prayer for a given date,
   * both in React state and in AsyncStorage
   */
  const updateHabitStatus = async (date: string, prayerId: string, completed: boolean) => {
    const currentStatuses = getStatusesForDate(historyData, date);
    const newStatuses = { ...currentStatuses, [prayerId]: completed };

    setHistoryData((currentData) => {
      const nextData = [...currentData];
      let entryIndex = -1;

      for (let i = 0; i < nextData.length; i++) {
        if (nextData[i].date === date) {
          entryIndex = i;
          break;
        }
      }

      if (entryIndex >= 0) {
        nextData[entryIndex] = { date, statuses: newStatuses };
      } else {
        nextData.push({ date, statuses: newStatuses });
      }

      return nextData;
    });

    try {
      await AsyncStorage.setItem(date, JSON.stringify(newStatuses));
    } catch (error) {
      console.error("Failed to save habit status", error);
    }
  };

  const value: HabitContextValue = {
    historyData,
    isLoading,
    updateHabitStatus,
    reloadData: loadHistoryData,
  };

  //* --------------------------- RETURN --------------------------- *//
  // Share history state with child components
  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

/**
 * Hook to easily access the habit tracking context
 * Must be used within a HabitProvider
 */
export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabits must be used inside HabitProvider");
  }
  return context;
}

/**
 * Finds old date string keys in AsyncStorage and migrates them
 * to the new consistent YYYY-MM-DD format
 */
async function migrateLegacyStorageKeys() {
  const allKeys = await AsyncStorage.getAllKeys();
  const legacyKeys: string[] = [];

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    if (!DATE_KEY_PATTERN.test(key)) {
      legacyKeys.push(key);
    }
  }

  for (let i = 0; i < legacyKeys.length; i++) {
    const oldKey = legacyKeys[i];
    const rawValue = await AsyncStorage.getItem(oldKey);
    if (!rawValue) {
      continue;
    }

    const parsedDate = new Date(Date.parse(oldKey));
    if (isNaN(parsedDate.getTime())) {
      continue;
    }

    const newKey = getDateKey(parsedDate);
    await AsyncStorage.setItem(newKey, rawValue);
    await AsyncStorage.removeItem(oldKey);
  }
}

/**
 * Reads all valid YYYY-MM-DD keys from AsyncStorage and parses
 * them into a list of history items for the app state
 */
async function readHistoryFromStorage(): Promise<HabitHistoryItem[]> {
  const allKeys = await AsyncStorage.getAllKeys();
  const dateKeys: string[] = [];

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    if (DATE_KEY_PATTERN.test(key)) {
      dateKeys.push(key);
    }
  }

  const storedItems = await AsyncStorage.multiGet(dateKeys);
  const loadedHistory: HabitHistoryItem[] = [];

  for (let i = 0; i < storedItems.length; i++) {
    const [date, value] = storedItems[i];
    if (value) {
      loadedHistory.push({ date, statuses: JSON.parse(value) });
    }
  }

  return loadedHistory;
}
