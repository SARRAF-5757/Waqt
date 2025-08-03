import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColors } from '@/hooks/useThemeColors';
import { useMaterial3ThemeContext } from '@/providers/materialYouProvider';

// Preset theme colors inspired by Islamic culture and prayer times
const THEME_COLORS = [
  { name: 'Salah Blue', color: '#4F8EF7' },
  { name: 'Mosque Green', color: '#2E7D0F' },
  { name: 'Dawn Gold', color: '#ffd500' },
  { name: 'Sunset Orange', color: '#ff870f' },
  { name: 'Night Purple', color: '#6750A4' },
  { name: 'Coral Pink', color: '#FF5A5F' },
];

const THEME_STORAGE_KEY = '@waqt_theme_color';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const themedColors = useThemeColors();
  const { updateTheme, resetTheme, theme } = useMaterial3ThemeContext();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Load the currently selected theme on component mount
  useEffect(() => {
    const loadCurrentTheme = async () => {
      try {
        const savedColor = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedColor) {
          setSelectedColor(savedColor);
        }
      } catch (error) {
        console.warn('Failed to load current theme:', error);
      }
    };

    loadCurrentTheme();
  }, []);

  const handleColorSelect = (color: string, name: string) => {
    setSelectedColor(color);
    updateTheme(color);
  };

  const handleResetTheme = async () => {
    await resetTheme();
    setSelectedColor(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedText style={styles.header}>Settings</ThemedText>

        {/* Material You Button */}
          <TouchableOpacity
            style={[ 
              styles.materialButton,
              {
                backgroundColor: selectedColor === null 
                  ? themedColors.surfaceVariant
                  : (themedColors.surfaceDim ?? themedColors.surfaceBright),
              },
            ]}
            onPress={handleResetTheme}
            activeOpacity={0.7}
          >
            <View
              style={[ 
                styles.colorCircle, 
                { backgroundColor: themedColors.primary }
              ]}
            />
            <ThemedText style={[styles.colorName, {
              color: selectedColor === null
                ? themedColors.onPrimaryContainer
                : themedColors.onSurfaceVariant
            }]}>Material You</ThemedText>
          </TouchableOpacity>

        {/* Color Options */}
        <View style={styles.colorGrid}>
          {THEME_COLORS.map((themeColor) => (
            <TouchableOpacity
              key={themeColor.color}
              style={[
                styles.colorOption,
                {
                  backgroundColor: selectedColor === themeColor.color
                    ? themedColors.surfaceVariant
                    : (themedColors.surfaceDim ?? themedColors.surfaceBright),
                },
              ]}
              onPress={() => handleColorSelect(themeColor.color, themeColor.name)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: themeColor.color },
                ]}
              />
              <ThemedText style={[styles.colorName, {
                color: selectedColor === themeColor.color
                  ? themedColors.onPrimaryContainer
                  : themedColors.onSurfaceVariant
              }]}>{themeColor.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  colorDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  materialButton: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
});
