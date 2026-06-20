import React, { createContext, useContext, useEffect, useState } from "react";
import { useMaterial3Theme, Material3Theme } from "@pchmn/expo-material3-theme";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_SETTINGS, MATERIAL_YOU_KEY, STORAGE_KEYS } from "@/constants/Settings";

type MaterialYouContextValue = {
  theme: Material3Theme;
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
  currentColor: string;
};

const MaterialYouContext = createContext<MaterialYouContextValue | undefined>(undefined);

type MaterialYouProviderProps = {
  children: React.ReactNode;
  fallbackSourceColor?: string;
};

/**
 * React hooks must always run in the same order, so this inner component
 * only mounts after we know which saved theme color to use
 */
function MaterialYouThemeLayer({
  children,
  initialColor,
  fallbackSourceColor,
  onThemeSelected,
  onMaterialYouSelected,
}: {
  children: React.ReactNode;
  initialColor: string;
  fallbackSourceColor: string;
  onThemeSelected: (color: string) => Promise<void>;
  onMaterialYouSelected: () => Promise<void>;
}) {
  const [activeColor, setActiveColor] = useState(initialColor);
  const useMaterialYou = activeColor === MATERIAL_YOU_KEY;

  const {
    theme,
    updateTheme: libraryUpdateTheme,
    resetTheme: libraryResetTheme,
  } = useMaterial3Theme({
    sourceColor: useMaterialYou ? undefined : activeColor,
    fallbackSourceColor,
  });

  /**
   * Updates the internal state, the material theme library, and triggers
   * the parent callback to save the new color
   */
  const updateTheme = async (color: string) => {
    setActiveColor(color);
    libraryUpdateTheme(color);
    await onThemeSelected(color);
  };

  /**
   * Resets to Material You mode, reverting the library to dynamic colors
   * and saving the preference
   */
  const resetTheme = async () => {
    setActiveColor(MATERIAL_YOU_KEY);
    libraryResetTheme();
    await onMaterialYouSelected();
  };

  // Sync activeColor if initialColor changes from the parent provider
  // (e.g., if loaded from storage later, though we only mount after load)
  useEffect(() => {
    setActiveColor(initialColor);
  }, [initialColor]);

  // Expose Material You context down the tree
  return (
    <MaterialYouContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        currentColor: activeColor,
      }}
    >
      {children}
    </MaterialYouContext.Provider>
  );
}

/**
 * Loads the saved theme color from storage and exposes Material 3 colors
 * to the rest of the app
 */
export function MaterialYouProvider({ children, fallbackSourceColor = DEFAULT_SETTINGS.fallbackThemeColor }: MaterialYouProviderProps) {
  //* ----------------------------- JS ----------------------------- *//
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedColor = await AsyncStorage.getItem(STORAGE_KEYS.themeColor);
        setCurrentColor(savedColor ?? MATERIAL_YOU_KEY);
      } catch (error) {
        console.warn("Failed to load saved theme", error);
        setCurrentColor(MATERIAL_YOU_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTheme();
  }, []);

  /**
   * Persists a newly selected theme color to AsyncStorage
   */
  const saveThemeColor = async (color: string) => {
    setCurrentColor(color);
    await AsyncStorage.setItem(STORAGE_KEYS.themeColor, color);
  };

  /**
   * Persists the Material You preference to AsyncStorage
   */
  const saveMaterialYouMode = async () => {
    setCurrentColor(MATERIAL_YOU_KEY);
    await AsyncStorage.setItem(STORAGE_KEYS.themeColor, MATERIAL_YOU_KEY);
  };

  //* --------------------------- RETURN --------------------------- *//
  if (isLoading || currentColor === null) {
    return null;
  }

  // Wrap children with the loaded initial color
  return (
    <MaterialYouThemeLayer
      initialColor={currentColor}
      fallbackSourceColor={fallbackSourceColor}
      onThemeSelected={saveThemeColor}
      onMaterialYouSelected={saveMaterialYouMode}
    >
      {children}
    </MaterialYouThemeLayer>
  );
}

/**
 * Hook to easily access the Material You context
 * Must be used within a MaterialYouProvider
 */
export function useMaterial3ThemeContext() {
  const context = useContext(MaterialYouContext);
  if (!context) {
    throw new Error("useMaterial3ThemeContext must be used inside MaterialYouProvider");
  }
  return context;
}

/**
 * Hook to quickly extract the active material palette for the current light/dark scheme
 */
export function useMaterial3Colors() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3ThemeContext();
  return theme[colorScheme ?? "light"];
}
