import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Pressable, Platform, TextInput, View, useColorScheme, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CustomPicker } from "@/components/CustomPicker";
import { ThemedText } from "@/components/ThemedText";
import { CALCULATION_METHOD_OPTIONS, DEFAULT_SETTINGS, MADHAB_OPTIONS, MATERIAL_YOU_KEY, STORAGE_KEYS, THEME_COLOR_OPTIONS } from "@/constants/Settings";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMaterial3ThemeContext } from "@/providers/materialYouProvider";
import { usePrayerTimes } from "@/providers/prayerTimesProvider";
import { useHabits } from "@/providers/habitProvider";

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
   * Prompts the user for confirmation before deleting all history.
   */
  const handleDeleteAll = () => {
    Alert.alert(
      "Delete all records",
      "Are you sure you want to delete all prayer time history recorded so far? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteAllHistory() },
      ]
    );
  };

  const isIOS = Platform.OS === "ios";
  const isMaterialYouMode = currentColor === MATERIAL_YOU_KEY;
  const sectionTitleStyle = isIOS ? styles.iosSectionHeader : styles.androidSectionHeader;

  //* --------------------------- RETURN --------------------------- *//
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={[styles.header, isIOS ? { paddingTop: insets.top + 10 } : undefined]}>
          Settings
        </ThemedText>

        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>Notifications</ThemedText>

        {/* Notification Settings */}
        <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>Waqt end time reminder (minutes before)</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              isIOS ? styles.iosTextInput : styles.androidTextInput,
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
        <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>Calculation Method</ThemedText>
          <CustomPicker
            key={`calc-${currentColor}-${colorScheme}`}
            label="Calculation Method"
            selectedValue={calculationMethod}
            onValueChange={handleMethodChange}
            items={CALCULATION_METHOD_OPTIONS}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>Madhab (Asr Shadow)</ThemedText>
          <CustomPicker
            key={`madhab-${currentColor}-${colorScheme}`}
            label="Madhab (Asr Shadow)"
            selectedValue={madhab}
            onValueChange={handleMadhabChange}
            items={MADHAB_OPTIONS}
          />
        </View>

        {/* Theme Settings */}
        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>Theme</ThemedText>
        {/* Material You theme option (only on android) */}
        {Platform.OS === "android" && (
          <Pressable
            key={`material-you-${currentColor}-${colorScheme}`}
            onPress={resetTheme}
            android_ripple={{ color: colors.primary }}
            style={({ pressed }) =>
              isIOS
                ? [
                    styles.themeOption,
                    styles.materialYouThemeOption,
                    {
                      backgroundColor: isMaterialYouMode ? colors.secondaryContainer : colors.surfaceVariant,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]
                : [
                    styles.themeOption,
                    styles.materialYouThemeOption,
                    {
                      backgroundColor: isMaterialYouMode ? colors.secondaryContainer : colors.surfaceVariant,
                    },
                  ]
            }
          >
            <View style={[styles.colorCircle, { backgroundColor: colors.primary }]} />
            <ThemedText
              style={[
                styles.colorName,
                {
                  color: isMaterialYouMode ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                },
              ]}
            >
              Material You
            </ThemedText>
          </Pressable>
        )}

        {/* Loop through and render the rest of the color options */}
        <View style={styles.colorGrid} key={`grid-${currentColor}-${colorScheme}`}>
          {THEME_COLOR_OPTIONS.map((themeColor) => {
            const isSelected = !isMaterialYouMode && currentColor === themeColor.color;

            return (
              <Pressable
                key={themeColor.color}
                onPress={() => updateTheme(themeColor.color)}
                android_ripple={{ color: themeColor.color }}
                style={({ pressed }) =>
                  isIOS
                    ? [
                        styles.themeOption,
                        styles.iosThemeOption,
                        {
                          backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceVariant,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]
                    : [
                        styles.themeOption,
                        styles.androidThemeOption,
                        {
                          backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceVariant,
                        },
                      ]
                }
              >
                <View style={[styles.colorCircle, { backgroundColor: themeColor.color }]} />
                <ThemedText
                  style={[
                    styles.colorName,
                    {
                      color: isSelected ? colors.onSurface : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {themeColor.name}
                </ThemedText>
              </Pressable>
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
              opacity: pressed && isIOS ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={[styles.deleteButtonText, { color: colors.error }]}>
            DELETE ALL RECORDS
          </ThemedText>
        </Pressable>

      </ScrollView>
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
  iosSectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 4,
  },
  androidSectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
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
  iosTextInput: {
    borderRadius: 12,
  },
  androidTextInput: {
    borderRadius: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  themeOption: {
    alignItems: "center",
    marginBottom: 16,
  },
  iosThemeOption: {
    width: "48%",
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
  },
  androidThemeOption: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  materialYouThemeOption: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    elevation: 1,
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
