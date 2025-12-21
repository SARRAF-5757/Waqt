import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMaterial3ThemeContext } from "@/providers/materialYouProvider";

// Special key to detect Material You mode
const MATERIAL_YOU_KEY = "MATERIAL_YOU";

// Preset theme colors inspired by Islamic culture and prayer times
const THEME_COLORS = [
  { name: "Salah Blue", color: "#4F8EF7" },
  { name: "Mosque Green", color: "#2E7D0F" },
  { name: "Dawn Gold", color: "#ffd500" },
  { name: "Sunset Orange", color: "#ff870f" },
  { name: "Night Purple", color: "#6750A4" },
  { name: "Coral Pink", color: "#FF5A5F" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const themedColors = useThemeColors();
  const { updateTheme, resetTheme, currentColor } = useMaterial3ThemeContext();

  // Check if we're currently in Material You mode
  const isMaterialYouMode = currentColor === MATERIAL_YOU_KEY;

  // Build list of color option buttons to be rendered
  const colorOptionButtons = [];

  for (let i = 0; i < THEME_COLORS.length; ++i) {
    const themeColor = THEME_COLORS[i];
    const isSelected = !isMaterialYouMode && currentColor === themeColor.color; // color is selected if it matches exactly and we're not in Material You mode

    colorOptionButtons.push(
      <TouchableOpacity
        key={themeColor.color}
        style={[
          styles.colorOption,
          {
            backgroundColor: isSelected ? themedColors.surfaceVariant : (themedColors.surfaceDim ?? themedColors.surfaceBright),
          },
        ]}
        onPress={() => updateTheme(themeColor.color)}
        activeOpacity={0.7}
      >
        <ThemedView style={[styles.colorCircle, { backgroundColor: themeColor.color }]} />
        <ThemedText
          style={[
            styles.colorName,
            {
              color: isSelected ? themedColors.onPrimaryContainer : themedColors.onSurfaceVariant,
            },
          ]}
        >
          {themeColor.name}
        </ThemedText>
      </TouchableOpacity>,
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedText style={styles.header}>Settings</ThemedText>

        {/* Material You Button (Only shows up on android) */}
        {Platform.OS === "android" && (
          <TouchableOpacity
            style={[
              styles.materialButton,
              {
                backgroundColor: isMaterialYouMode ? themedColors.surfaceVariant : (themedColors.surfaceDim ?? themedColors.surfaceBright),
              },
            ]}
            onPress={resetTheme}
            activeOpacity={0.7}
          >
            <ThemedView style={[styles.colorCircle, { backgroundColor: themedColors.primary }]} />
            <ThemedText
              style={[
                styles.colorName,
                {
                  color: isMaterialYouMode ? themedColors.onPrimaryContainer : themedColors.onSurfaceVariant,
                },
              ]}
            >
              Material You
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Color Options */}
        <ThemedView style={styles.colorGrid}>{colorOptionButtons}</ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    paddingVertical: 6,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorOption: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  colorName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  colorDescription: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  materialButton: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
});
