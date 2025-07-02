import React, { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PRAYER_HABITS, getTodayDateString } from '@/constants/Habits';


export default function Index() {
  // States
  const [prayerStatuses, setPrayerStatuses] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Hooks
  const todayDateString = getTodayDateString();
  const colorScheme = useColorScheme() ?? 'light';
  const themedColors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Load data for today when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      
      const loadTodaysData = async () => {
        try {
          const storedData = await AsyncStorage.getItem(todayDateString);
          if (isActive) {
            const initialStatus = PRAYER_HABITS.reduce((acc, habit) => {
              acc[habit.id] = false;
              return acc;
            }, {} as Record<string, boolean>);

            setPrayerStatuses(storedData ? JSON.parse(storedData) : initialStatus);
            setIsLoaded(true);
          }
        } catch (error) {
          console.error("Failed to load today's data", error);
        }
      };

      loadTodaysData();

      return () => {
        isActive = false;
      };

    }, [todayDateString])
  );

  // Event Handler
  const handleTogglePrayer = async (habitId: string) => {
    const newStatuses = {
      ...prayerStatuses,
      [habitId]: !prayerStatuses[habitId],
    };
    setPrayerStatuses(newStatuses);

    try {
      await AsyncStorage.setItem(todayDateString, JSON.stringify(newStatuses));
    } catch (error) {
      console.error('Failed to save data', error);
    }
  };
  
  // Render Methods
  if (!isLoaded) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={themedColors.tint} />
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText style={[styles.dateHeader, { paddingTop: insets.top }]}>Today: {todayDateString}</ThemedText>
      {PRAYER_HABITS.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => handleTogglePrayer(habit.id)}
            activeOpacity={0.8}
            style={styles.touchableRow}
          >
            <ThemedView 
              lightColor="#FFFFFF" 
              darkColor="#1C1C1E" 
              style={styles.habitRow}
            >
              <Checkbox
                //TODO: add streamlined color
                value={prayerStatuses[habit.id] || false}
                onValueChange={() => handleTogglePrayer(habit.id)}
                style={styles.checkbox}
              />
              <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  dateHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  touchableRow: {
    marginBottom: 12,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
  habitName: {
    marginLeft: 16,
    fontSize: 18,
    flex: 1,
  },
});