import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDateKey } from '../constants/Habits';

//# Type definitions for habit data and context
// Each instance is one day's habit completion status
interface HistoryItem {
  date: string;                       // '2025-08-16'
  statuses: Record<string, boolean>;  // { fajr: true, dhuhr: false, ... }
}

//! The shape of the context value shared with all components
interface HistoryContextType {
  historyData: HistoryItem[];         // All habit data loaded from storage
  isLoading: boolean;                 // True while loading from storage
  updateHabitStatus: (date: string, prayerId: string, completed: boolean) => Promise<void>; // Mark a prayer as done/not done
  reloadData: () => void;             // Reload all data from storage
}

// The context object (initially undefined)
const HistoryContext = createContext<HistoryContextType|undefined> (undefined);

//# The Provider component: manages state and shares it with children
export const HabitProvider = ({ children }: { children: ReactNode }) => {

  // States
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Loads all habit data from AsyncStorage and migrates old keys if needed
  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      // Find legacy keys (not date keys)
      const legacyKeys = [];

      for (let i = 0; i < allKeys.length; ++i) {
        const key = allKeys[i];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {   // check if key does not match 'YYYY-MM-DD' format
          legacyKeys.push(key);
        }
      }

      // Migrate legacy keys
      for (let i = 0; i < legacyKeys.length; ++i) {
        const oldKey = legacyKeys[i];
        const rawValue = await AsyncStorage.getItem(oldKey);

        if (rawValue) {
          const parsedDate = new Date(Date.parse(oldKey));

          if (!isNaN(parsedDate.getTime())) {             // if a valid date
            const newKey = getDateKey(parsedDate);        // convert to 'YYYY-MM-DD' format
            await AsyncStorage.setItem(newKey, rawValue); // save under new key
            await AsyncStorage.removeItem(oldKey);        // remove old key
          }
        }
      }

      // Get keys again after migration
      const updatedKeys = await AsyncStorage.getAllKeys();
      // Find date keys
      const dateKeys = [];
      for (let i = 0; i < updatedKeys.length; ++i) {
        const key = updatedKeys[i];

        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
          dateKeys.push(key);
        }
      }

      // Get stored items
      const storedItems = await AsyncStorage.multiGet(dateKeys);
      // Build loadedHistory array
      const loadedHistory = [];
      for (let i = 0; i < storedItems.length; ++i) {
        const [key, value] = storedItems[i];
        if (value) {
          loadedHistory.push({ date: key, statuses: JSON.parse(value) });
        }
      }
      setHistoryData(loadedHistory);
    } catch (error) {
      console.error('Failed to load history data from context', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);



  // Update the completion status for a specific habit on a specific date
  // Update state immediately for UI, then save to AsyncStorage
  const updateHabitStatus = async (date: string, prayerId: string, completed: boolean) => {
    // Find the existing data for the date
    let dayData: Record<string, boolean> = {};

    for (let i = 0; i < historyData.length; ++i) {
      if (historyData[i].date === date) {
        dayData = historyData[i].statuses;
        break;
      }
    }
    const newStatuses = { ...dayData, [prayerId]: completed };

    // Update state immediately for instant UI feedback
    setHistoryData(currentData => {
      let existingEntryIndex = -1;
      for (let i = 0; i < currentData.length; ++i) {
        if (currentData[i].date === date) {
          existingEntryIndex = i;
          break;
        }
      }
      if (existingEntryIndex > -1) {
        // Update existing entry
        const newData = [...currentData];
        newData[existingEntryIndex] = { date, statuses: newStatuses };
        return newData;
      } else {
        // Add new entry
        return [...currentData, { date, statuses: newStatuses }];
      }
    });

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(date, JSON.stringify(newStatuses));
    } catch (error) {
      console.error('Failed to save updated habit status', error);
    }
  };

  //! The value shared with all children via context
  const value = {
    historyData,
    isLoading,
    updateHabitStatus,
    reloadData: loadHistoryData,
  };

  // The Provider wraps children and makes the context available
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

//# Custom hook for easy access to the context in any component
export const useHabits = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};