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
 * only mounts after we know which saved theme color to use.
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
  const useMaterialYou = initialColor === MATERIAL_YOU_KEY;

  const { theme, updateTheme: libraryUpdateTheme, resetTheme: libraryResetTheme } = useMaterial3Theme({
    sourceColor: useMaterialYou ? undefined : initialColor,
    fallbackSourceColor,
  });

  const updateTheme = async (color: string) => {
    libraryUpdateTheme(color);
    await onThemeSelected(color);
  };

  const resetTheme = async () => {
    libraryResetTheme();
    await onMaterialYouSelected();
  };

  return (
    <MaterialYouContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        currentColor: initialColor,
      }}
    >
      {children}
    </MaterialYouContext.Provider>
  );
}

/**
 * Loads the saved theme color from storage and exposes Material 3 colors
 * to the rest of the app.
 */
export function MaterialYouProvider({
  children,
  fallbackSourceColor = DEFAULT_SETTINGS.fallbackThemeColor,
}: MaterialYouProviderProps) {
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

  const saveThemeColor = async (color: string) => {
    setCurrentColor(color);
    await AsyncStorage.setItem(STORAGE_KEYS.themeColor, color);
  };

  const saveMaterialYouMode = async () => {
    setCurrentColor(MATERIAL_YOU_KEY);
    await AsyncStorage.setItem(STORAGE_KEYS.themeColor, MATERIAL_YOU_KEY);
  };

  if (isLoading || currentColor === null) {
    return null;
  }

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

export function useMaterial3ThemeContext() {
  const context = useContext(MaterialYouContext);
  if (!context) {
    throw new Error("useMaterial3ThemeContext must be used inside MaterialYouProvider");
  }
  return context;
}

export function useMaterial3Colors() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3ThemeContext();
  return theme[colorScheme ?? "light"];
}
