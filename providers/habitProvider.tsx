import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDateKey } from '../constants/Habits';

// structure of history instances
interface HistoryItem {
  date: string;
  statuses: Record<string, boolean>;
}

// context structure
interface HabitContextType {
  historyData: HistoryItem[];
  isLoading: boolean;
  
  updateHabitStatus: (date: string, habitId: string, completed: boolean) => Promise<void>;
  // Add a function to manually trigger a reload if needed
  reloadData: () => void;
}

// Create the context with an undefined value (but able to hold HabitContextType later on as well)
const HabitContext = createContext<HabitContextType|undefined> (undefined);

// Create the Provider component
export const HabitProvider = ({ children }: { children: ReactNode }) => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const legacyKeys = allKeys.filter(key => !/^\d{4}-\d{2}-\d{2}$/.test(key));
      for (const oldKey of legacyKeys) {
        const rawValue = await AsyncStorage.getItem(oldKey);
        if (rawValue) {
          const parsedDate = new Date(Date.parse(oldKey));
          if (!isNaN(parsedDate.getTime())) {
            const newKey = getDateKey(parsedDate);
            await AsyncStorage.setItem(newKey, rawValue);
            await AsyncStorage.removeItem(oldKey);
          }
        }
      }

      // Get keys again after migration to include newly migrated keys
      const updatedKeys = await AsyncStorage.getAllKeys();
      const dateKeys = updatedKeys.filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
      const storedItems = await AsyncStorage.multiGet(dateKeys);
      const loadedHistory = storedItems
        .map(([key, value]) => (value ? { date: key, statuses: JSON.parse(value) } : null))
        .filter((item): item is HistoryItem => item !== null);
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

  const updateHabitStatus = async (date: string, habitId: string, completed: boolean) => {
    // Find the existing data for the date
    const dayData = historyData.find(item => item.date === date)?.statuses || {};
    const newStatuses = { ...dayData, [habitId]: completed };

    // Update state immediately for instant UI feedback
    setHistoryData(currentData => {
      const existingEntryIndex = currentData.findIndex(item => item.date === date);
      
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
  };``

  const value = {
    historyData,
    isLoading,
    updateHabitStatus,
    reloadData: loadHistoryData,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

// hook for easy access to the context
export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};