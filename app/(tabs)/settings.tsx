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
  { name: 'Prayer Blue', color: '#4F8EF7' },
  { name: 'Dawn Gold', color: '#FFB000' },
  { name: 'Mosque Green', color: '#2E7D0F' },
  { name: 'Sunset Orange', color: '#FF6B35' },
  { name: 'Night Purple', color: '#6750A4' },
  { name: 'Kaaba Black', color: '#1C1B1F' },
  { name: 'Pure White', color: '#FFFFFF' },
  { name: 'Coral Pink', color: '#FF5A5F' },
];

const THEME_STORAGE_KEY = '@waqt_theme_color';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const themedColors = useThemeColors();
  const { updateTheme, resetTheme } = useMaterial3ThemeContext();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Load the currently selected theme on component mount
  useEffect(() => {
    const loadCurrentTheme = async () => {
      try {
        const savedColor = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        console.log('Loaded saved color from storage:', savedColor);
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
    console.log('Updated theme color to:', color);
  };

  const handleResetTheme = async () => {
    await resetTheme();
    setSelectedColor(null);
    Alert.alert(
      'Theme Reset',
      'Theme has been reset to Material You (system colors)',
      [{ text: 'OK' }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedText style={styles.header}>Settings</ThemedText>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.colorGrid}>
            {THEME_COLORS.map((themeColor) => (
              <TouchableOpacity
                key={themeColor.color}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: themedColors.surface,
                    borderColor: selectedColor === themeColor.color 
                      ? themedColors.primary 
                      : themedColors.onSurfaceVariant,
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
                <ThemedText style={styles.colorName}>{themeColor.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: themedColors.surfaceVariant,
                borderColor: themedColors.onSurfaceVariant,
              },
            ]}
            onPress={handleResetTheme}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.resetButtonText}>Material You (Android Only)</ThemedText>
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 6,
    marginBottom: 24
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
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
    borderWidth: 2,
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
  resetButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutCard: {
    borderRadius: 12,
    padding: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.8,
  },
});
