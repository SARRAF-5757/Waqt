import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Pressable, Platform, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CustomPicker } from "@/components/CustomPicker";
import { ThemedText } from "@/components/ThemedText";
import {
  CALCULATION_METHOD_OPTIONS,
  DEFAULT_SETTINGS,
  MADHAB_OPTIONS,
  MATERIAL_YOU_KEY,
  STORAGE_KEYS,
  THEME_COLOR_OPTIONS,
} from "@/constants/Settings";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMaterial3ThemeContext } from "@/providers/materialYouProvider";
import { usePrayerTimes } from "@/providers/prayerTimesProvider";

/**
 * Settings screen.
 * Saves user preferences to AsyncStorage and reloads prayer times when needed.
 */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { updateTheme, resetTheme, currentColor } = useMaterial3ThemeContext();
  const { reload: reloadPrayerTimes } = usePrayerTimes();

  const [endTimeOffset, setEndTimeOffset] = useState<string>(DEFAULT_SETTINGS.endTimeOffset);
  const [calculationMethod, setCalculationMethod] = useState<string>(DEFAULT_SETTINGS.calculationMethod);
  const [madhab, setMadhab] = useState<string>(DEFAULT_SETTINGS.madhab);

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

  const handleOffsetChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setEndTimeOffset(numericValue);
    AsyncStorage.setItem(STORAGE_KEYS.endTimeOffset, numericValue);
  };

  const handleMethodChange = (value: string) => {
    setCalculationMethod(value);
    AsyncStorage.setItem(STORAGE_KEYS.calculationMethod, value).then(() => {
      reloadPrayerTimes();
    });
  };

  const handleMadhabChange = (value: string) => {
    setMadhab(value);
    AsyncStorage.setItem(STORAGE_KEYS.madhab, value).then(() => {
      reloadPrayerTimes();
    });
  };

  const isIOS = Platform.OS === "ios";
  const isMaterialYouMode = currentColor === MATERIAL_YOU_KEY;
  const sectionTitleStyle = isIOS ? styles.iosSectionHeader : styles.androidSectionHeader;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.header}>
          Settings
        </ThemedText>

        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>
          Notifications
        </ThemedText>
        <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>
            End time offset (minutes before)
          </ThemedText>
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

        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>
          Prayer Times
        </ThemedText>
        <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>
            Calculation Method
          </ThemedText>
          <CustomPicker
            label="Calculation Method"
            selectedValue={calculationMethod}
            onValueChange={handleMethodChange}
            items={CALCULATION_METHOD_OPTIONS}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderRadius: isIOS ? 20 : 12 }]}>
          <ThemedText style={[styles.settingLabel, { color: colors.onSurfaceVariant }]}>
            Madhab (Asr Shadow)
          </ThemedText>
          <CustomPicker
            label="Madhab (Asr Shadow)"
            selectedValue={madhab}
            onValueChange={handleMadhabChange}
            items={MADHAB_OPTIONS}
          />
        </View>

        <ThemedText style={[sectionTitleStyle, { color: colors.onSurfaceVariant }]}>Theme</ThemedText>

        {Platform.OS === "android" && (
          <Pressable
            onPress={resetTheme}
            android_ripple={{ color: colors.primary }}
            style={({ pressed }) => [
              styles.themeOption,
              styles.androidThemeOption,
              {
                backgroundColor: isMaterialYouMode ? colors.secondaryContainer : colors.surfaceVariant,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
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

        <View style={styles.colorGrid}>
          {THEME_COLOR_OPTIONS.map((themeColor) => {
            const isSelected = !isMaterialYouMode && currentColor === themeColor.color;

            return (
              <Pressable
                key={themeColor.color}
                onPress={() => updateTheme(themeColor.color)}
                android_ripple={{ color: themeColor.color }}
                style={({ pressed }) => [
                  styles.themeOption,
                  isIOS ? styles.iosThemeOption : styles.androidThemeOption,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryContainer
                      : colors.surfaceVariant,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
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
      </ScrollView>
    </View>
  );
}

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
    marginTop: 64,
    marginBottom: 48,
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
    borderWidth: 1,
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
});
