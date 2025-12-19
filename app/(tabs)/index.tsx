import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PRAYER_HABITS, getDateKey } from '@/constants/Habits';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHabits } from '@/providers/habitProvider';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function Index() {
  const { historyData, updateHabitStatus } = useHabits();       // get habit data and update function from context
  const todayKey = getDateKey();                                // get today's date key
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  let todayStatuses: Record<string, boolean> = {};
  const [prayerStatuses, setPrayerStatuses] = useState<Record<string, boolean>>(todayStatuses); // Local state for prayer checkboxes (for instant UI feedback)
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);

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

  //# Schedule a notification
  const sendTestNotification = async () => {
    try {
      // Check/request permissions
      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow notifications.');
        return;
      }

      // Platform specific settings
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
        });
      } else if (Platform.OS === 'ios') {
        //TODO: Implement ios notifications
      }

      // Schedule a notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Waqt — Test Notification',
          body: 'This is a test notification.',
          data: { test: true },
        },
        trigger: null, // `null` = display immediately
      });
    } catch (error) {
      console.error('Failed to send test notification', error);
      Alert.alert('Error', 'Failed to schedule notification. See console for details.');
    }
  };

  //# On prayer checkbox press
  const handleTogglePrayer = (id: string) => {
    const newVal = !prayerStatuses[id];                         // flip the status for the given prayer id
    setPrayerStatuses(s => ({ ...s, [id]: newVal }));           // update local state (for UI refresh)
    updateHabitStatus(todayKey, id, newVal);                    // update context data
  };
  
  
  //* Build list of prayers to render
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
        {/* Test notification button (developer/testing only) */}
        <TouchableOpacity onPress={sendTestNotification} style={{
          marginHorizontal: 20,
          backgroundColor: colors.surfaceVariant,
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 16,
          alignItems: 'center',
        }} activeOpacity={0.7}>
          <ThemedText style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600'
          }}>Send Notification</ThemedText>
        </TouchableOpacity>
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
