import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColors } from '@/hooks/useThemeColors';
import { PRAYER_HABITS, getDateKey } from '@/constants/Habits';
import { useHabits } from '@/providers/habitProvider';


export default function Index() {
  // Hooks
  const { historyData, updateHabitStatus } = useHabits();
  const todayKey = getDateKey();
  const colors = useThemeColors();
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
        <ThemedText style={[styles.header, { paddingTop: insets.top }]}>Waqt</ThemedText>
        {/* Render each prayer habit */}
        {PRAYER_HABITS.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              onPress={() => handleTogglePrayer(habit.id)}
              activeOpacity={0.5}
              style={styles.touchableRow}
            >
              <ThemedView
                lightColor={colors.surfaceVariant}
                darkColor={colors.surfaceVariant}
                style={styles.habitRow}
              >
                <Checkbox
                  color={colors.primary}
                  value={prayerStatuses[habit.id] || false}
                  onValueChange={() => handleTogglePrayer(habit.id)}
                  style={[styles.checkbox]}
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    paddingVertical: 6,
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