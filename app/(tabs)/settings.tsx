import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Pressable, TextInput, View, useColorScheme, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { Host } from "@expo/ui";
import { AlertDialog, Text, TextButton, Checkbox as JetpackCheckbox, MultiChoiceSegmentedButtonRow, SegmentedButton } from "@expo/ui/jetpack-compose";

import { CustomPicker } from "@/components/CustomPicker";
import { ThemedText } from "@/components/ThemedText";
import { CALCULATION_METHOD_OPTIONS, DEFAULT_SETTINGS, MADHAB_OPTIONS, MATERIAL_YOU_KEY, STORAGE_KEYS, THEME_COLOR_OPTIONS } from "@/constants/Settings";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMaterial3ThemeContext } from "@/providers/materialYouProvider";
import { useHabits } from "@/providers/habitProvider";
import { usePrayerTimes } from "@/providers/prayerTimesProvider";

/**
 * Settings screen
 * !Saves user preferences to AsyncStorage and reloads prayer times when needed
 */
export default function SettingsScreen() {
  //* ----------------------------- JS ----------------------------- *//
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const { updateTheme, resetTheme, currentColor } = useMaterial3ThemeContext();
  const { reload: reloadPrayerTimes } = usePrayerTimes();
  const { deleteAllHistory } = useHabits();

  const [endTimeOffset, setEndTimeOffset] = useState<string>(DEFAULT_SETTINGS.endTimeOffset);
  const [calculationMethod, setCalculationMethod] = useState<string>(DEFAULT_SETTINGS.calculationMethod);
  const [madhab, setMadhab] = useState<string>(DEFAULT_SETTINGS.madhab);
  const [showStartTime, setShowStartTime] = useState<boolean>(DEFAULT_SETTINGS.showStartTime === "true");
  const [showEndTime, setShowEndTime] = useState<boolean>(DEFAULT_SETTINGS.showEndTime === "true");

  /**
   * Load saved settings from AsyncStorage when the screen mounts.
   */
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.endTimeOffset).then((value) => {
      if (value) {
        setEndTimeOffset(value);
      }
    });
    AsyncStorage.getItem(STORAGE_KEYS.calculationMethod).then((value) => {
      if (value) {
        setCalculationMethod(value);
      }
    });
    AsyncStorage.getItem(STORAGE_KEYS.madhab).then((value) => {
      if (value) {
        setMadhab(value);
      }
    });
    AsyncStorage.getItem(STORAGE_KEYS.showStartTime).then((value) => {
      if (value) {
        setShowStartTime(value === "true");
      }
    });
    AsyncStorage.getItem(STORAGE_KEYS.showEndTime).then((value) => {
      if (value) {
        setShowEndTime(value === "true");
      }
    });
  }, []);

  /**
   * Updates the notification end time offset
   * Strips non-numeric characters before saving
   */
  const handleOffsetChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setEndTimeOffset(numericValue);
    AsyncStorage.setItem(STORAGE_KEYS.endTimeOffset, numericValue);
  };

  /**
   * Updates the prayer calculation method
   * Reloads prayer times right after saving to reflect changes instantly
   */
  const handleMethodChange = (value: string) => {
    setCalculationMethod(value);
    AsyncStorage.setItem(STORAGE_KEYS.calculationMethod, value).then(() => {
      reloadPrayerTimes();
    });
  };

  /**
   * Updates the Madhab preference for Asr calculation
   * Reloads prayer times right after saving to reflect changes instantly
   */
  const handleMadhabChange = (value: string) => {
    setMadhab(value);
    AsyncStorage.setItem(STORAGE_KEYS.madhab, value).then(() => {
      reloadPrayerTimes();
    });
  };

  /**
   * Toggles the display of the prayer's starting time on the home screen
   */
  const handleShowStartTimeChange = (value: boolean) => {
    setShowStartTime(value);
    AsyncStorage.setItem(STORAGE_KEYS.showStartTime, value ? "true" : "false");
  };

  /**
   * Toggles the display of the prayer's ending time on the home screen
   */
  const handleShowEndTimeChange = (value: boolean) => {
    setShowEndTime(value);
    AsyncStorage.setItem(STORAGE_KEYS.showEndTime, value ? "true" : "false");
  };


  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /**
   * Prompts the user for confirmation before deleting all history.
   */
  const handleDeleteAll = () => {
    setIsDeleteDialogOpen(true);
  };

  const isMaterialYouMode = currentColor === MATERIAL_YOU_KEY;
  const sectionTitleStyle = styles.sectionHeader;

  //* --------------------------- RETURN --------------------------- *//
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <ThemedText type="title" style={styles.header}>
          Settings
        </ThemedText>

        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>Notifications</ThemedText>

        {/* Notification Settings */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderRadius: 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>Waqt end time reminder (minutes before)</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              styles.androidTextInput,
              {
                color: colors.onSurface,
                borderColor: colors.outline,
                backgroundColor: colors.surface,
              },
            ]}
            keyboardType="numeric"
            value={endTimeOffset}
            onChangeText={handleOffsetChange}
            placeholder={DEFAULT_SETTINGS.endTimeOffset}
            placeholderTextColor={colors.onSurfaceVariant}
          />
        </View>

        {/* Calculation Settings */}
        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>Prayer Times</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderRadius: 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>Calculation Method</ThemedText>
          <CustomPicker
            key={`calc-${currentColor}-${colorScheme}`}
            label="Calculation Method"
            selectedValue={calculationMethod}
            onValueChange={handleMethodChange}
            items={CALCULATION_METHOD_OPTIONS}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderRadius: 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>Madhab (Asr Shadow)</ThemedText>
          <CustomPicker
            key={`madhab-${currentColor}-${colorScheme}`}
            label="Madhab (Asr Shadow)"
            selectedValue={madhab}
            onValueChange={handleMadhabChange}
            items={MADHAB_OPTIONS}
          />
        </View>

        {/* Appearance Settings */}
        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>Appearance</ThemedText>
        
        <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderRadius: 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant, marginBottom: 16 }]}>Time Display</ThemedText>
          <Host matchContents={{ vertical: true }} style={{ width: "100%", marginTop: 8, marginBottom: 8 }}>
            <MultiChoiceSegmentedButtonRow modifiers={[{ $type: "fillMaxWidth" }]}>
              <SegmentedButton
                checked={showStartTime}
                onCheckedChange={handleShowStartTimeChange}
                colors={{
                  activeContainerColor: colors.secondaryContainer,
                  activeContentColor: colors.onSecondaryContainer,
                  inactiveContainerColor: colors.surface,
                  inactiveContentColor: colors.onSurface,
                }}
              >
                <SegmentedButton.Label>
                  <Text color={showStartTime ? colors.onSecondaryContainer : colors.onSurface}>Start Time</Text>
                </SegmentedButton.Label>
              </SegmentedButton>
              <SegmentedButton
                checked={showEndTime}
                onCheckedChange={handleShowEndTimeChange}
                colors={{
                  activeContainerColor: colors.secondaryContainer,
                  activeContentColor: colors.onSecondaryContainer,
                  inactiveContainerColor: colors.surface,
                  inactiveContentColor: colors.onSurface,
                }}
              >
                <SegmentedButton.Label>
                  <Text color={showEndTime ? colors.onSecondaryContainer : colors.onSurface}>End Time</Text>
                </SegmentedButton.Label>
              </SegmentedButton>
            </MultiChoiceSegmentedButtonRow>
          </Host>
        </View>

        {/* Material You theme option - Native dynamic coloring */}
        <View style={[styles.themeOptionContainer, { width: "100%", backgroundColor: isMaterialYouMode ? colors.secondaryContainer : colors.surfaceContainer }]}>
          <View style={styles.themeOptionRippleClipper}>
            <Pressable
              key={`material-you-${currentColor}-${colorScheme}`}
              onPress={resetTheme}
              android_ripple={{ color: colors.primary }}
              style={({ pressed }) => [
                styles.themeOptionInner,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[styles.colorCircle, { backgroundColor: colors.primary }]} />
              <ThemedText style={[styles.colorName, { color: isMaterialYouMode ? colors.onSecondaryContainer : colors.onSurfaceVariant }]}>
                Material You
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Loop through and render the rest of the color options */}
        <View style={styles.colorGrid} key={`grid-${currentColor}-${colorScheme}`}>
          {THEME_COLOR_OPTIONS.map((themeColor) => {
            const isSelected = !isMaterialYouMode && currentColor === themeColor.color;

            return (
              <View key={`container-${themeColor.color}`} style={[styles.themeOptionContainer, { width: "48%", backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainer }]}>
                <View style={styles.themeOptionRippleClipper}>
                  <Pressable
                    key={themeColor.color}
                    onPress={() => updateTheme(themeColor.color)}
                    android_ripple={{ color: themeColor.color }}
                    style={({ pressed }) => [
                      styles.themeOptionInner,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: themeColor.color }]} />
                    <ThemedText style={[styles.colorName, { color: isSelected ? colors.onSurface : colors.onSurfaceVariant }]}>
                      {themeColor.name}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delete Data Section */}
        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant, marginTop: 32 }]}>⚠️ Danger Zone ⚠️</ThemedText>
        <Pressable
          onPress={handleDeleteAll}
          android_ripple={{ color: colors.error }}
          style={({ pressed }) => [
            styles.deleteButton,
            {
              backgroundColor: colors.errorContainer,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={[styles.deleteButtonText, { color: colors.error }]}>
            DELETE ALL RECORDS
          </ThemedText>
        </Pressable>

      </ScrollView>

      {isDeleteDialogOpen && (
        <Host matchContents seedColor={currentColor === MATERIAL_YOU_KEY ? undefined : currentColor}>
          <AlertDialog onDismissRequest={() => setIsDeleteDialogOpen(false)}>
            <AlertDialog.Title>
              <Text>Delete all records</Text>
            </AlertDialog.Title>
            <AlertDialog.Text>
              <Text>Are you sure you want to delete all prayer time history recorded so far? This action cannot be undone.</Text>
            </AlertDialog.Text>
            <AlertDialog.DismissButton>
              <TextButton onClick={() => setIsDeleteDialogOpen(false)}>
                <Text>Cancel</Text>
              </TextButton>
            </AlertDialog.DismissButton>
            <AlertDialog.ConfirmButton>
              <TextButton
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  deleteAllHistory();
                }}
              >
                <Text color={colors.error}>Delete</Text>
              </TextButton>
            </AlertDialog.ConfirmButton>
          </AlertDialog>
        </Host>
      )}
    </View>
  );
}

//* --------------------------- RETURN --------------------------- *//
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    textAlign: "center",
    marginTop: 18,
    marginBottom: 42,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  historyIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginRight: 12,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  androidTextInput: {
    borderRadius: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  themeOptionContainer: {
    borderRadius: 16,
    elevation: 1,
    marginBottom: 16,
  },
  themeOptionRippleClipper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  themeOptionInner: {
    alignItems: "center",
    padding: 16,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
  },
  colorName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  deleteButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
