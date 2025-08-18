import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PRAYER_HABITS, getDateKey } from '@/constants/Habits';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHabits } from '@/providers/habitProvider';


export default function Index() {
  const { historyData, updateHabitStatus } = useHabits();       // get habit data and update function from context
  const todayKey = getDateKey();                                // get today's date key
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  let todayStatuses: Record<string, boolean> = {};
  const [prayerStatuses, setPrayerStatuses] = useState<Record<string, boolean>>(todayStatuses); // Local state for prayer checkboxes (for instant UI feedback)

  // Find today's prayer completion statuses from context data
  for (let i = 0; i < historyData.length; ++i) {
    const habitEntry = historyData[i];
    if (habitEntry.date === todayKey && habitEntry.statuses) {  // for each entry in the history data, if the date matches today and has prayer statuses
      todayStatuses = habitEntry.statuses;                      // set today's statuses to that entry's statuses
      break;
    }
  }

  // Sync local state with context data if date changes or completion statuses change
  useEffect(() => {
    setPrayerStatuses(todayStatuses);
  }, [todayKey, JSON.stringify(todayStatuses)]);

  // On prayer checkbox press
  const handleTogglePrayer = (id: string) => {
    const newVal = !prayerStatuses[id];                         // flip the status for the given prayer id
    setPrayerStatuses(s => ({ ...s, [id]: newVal }));           // update local state (for UI refresh)
    updateHabitStatus(todayKey, id, newVal);                    // update context data
  };
  
  
  // Build list of prayers to render
  const prayerHabitRows = [];
  
  for (let i = 0; i < PRAYER_HABITS.length; ++i) {
    const habit = PRAYER_HABITS[i];
    prayerHabitRows.push(
      <TouchableOpacity
        key={habit.id}
        onPress={() => handleTogglePrayer(habit.id)}
        activeOpacity={0.5}
        style={styles.touchableRow}
      >
        <ThemedView
          lightColor={prayerStatuses[habit.id] || false ? colors.surfaceVariant : colors.surfaceDim}
          darkColor={prayerStatuses[habit.id] || false ? colors.surfaceVariant : colors.surfaceBright}
          style={styles.habitRow}
        >
          <Checkbox
            color={prayerStatuses[habit.id] || false ? colors.primary : colors.onSurfaceVariant}
            value={prayerStatuses[habit.id] || false}
            onValueChange={() => handleTogglePrayer(habit.id)}
            style={[styles.checkbox]}
          />
          <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText style={[styles.header, { paddingTop: insets.top+6 }]}>Waqt</ThemedText>
        {prayerHabitRows}
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
    padding: 20,
  },
  header: {
    fontSize: 30,
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