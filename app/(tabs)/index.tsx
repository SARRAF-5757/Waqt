import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PRAYER_HABITS, getTodayDateString, getDateKey } from '@/constants/Habits';
import { useHabits } from '@/contexts/HabitContext';


export default function Index() {
  // Hooks
  const { historyData, updateHabitStatus } = useHabits();
  const todayDateString = getTodayDateString();
  const todayKey = getDateKey();
  const colorScheme = useColorScheme() ?? 'light';
  const themedColors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Derive today's statuses from context data
  const todayStatuses = historyData.find(h => h.date === todayKey)?.statuses || {};
  const [prayerStatuses, setPrayerStatuses] = useState<Record<string, boolean>>(todayStatuses);

  // Only update local state if todayKey changes (not on every render)
  useEffect(() => {
    setPrayerStatuses(todayStatuses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey, JSON.stringify(todayStatuses)]);


  // Event Handler
  const handleTogglePrayer = (id: string) => {
    const newVal = !prayerStatuses[id];
    setPrayerStatuses(s => ({ ...s, [id]: newVal }));
    updateHabitStatus(todayKey, id, newVal);
  };
  
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText style={[styles.dateHeader, { paddingTop: insets.top }]}>Today: {todayDateString}</ThemedText>
        {/* Render each prayer habit */}
        {PRAYER_HABITS.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              onPress={() => handleTogglePrayer(habit.id)}
              activeOpacity={0.5}
              style={styles.touchableRow}
            >
              <ThemedView 
                lightColor="#FFFFFF" 
                darkColor="#1C1C1E" 
                style={styles.habitRow}
              >
                <Checkbox
                  color='#4F8EF7'
                  value={prayerStatuses[habit.id] || false}
                  onValueChange={() => handleTogglePrayer(habit.id)}
                  style={[
                    styles.checkbox,
                    {
                      borderColor: prayerStatuses[habit.id] ? '#4F8EF7' : themedColors.icon,
                      borderWidth: 2,
                      backgroundColor: prayerStatuses[habit.id] ? '#4F8EF7' : 'transparent',
                    }
                  ]}
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
  contentContainer: {
    padding: 25,
    paddingTop: 30,
  },
  dateHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  touchableRow: {
    marginBottom: 20,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 9,
  },
  habitName: {
    marginLeft: 16,
    fontSize: 18,
    flex: 1,
  },
});