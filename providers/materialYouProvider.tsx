import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMaterialColors } from "@expo/ui/jetpack-compose";
import { useColorScheme } from "react-native";
import { DEFAULT_SETTINGS, MATERIAL_YOU_KEY, STORAGE_KEYS } from "@/constants/Settings";

type MaterialYouContextValue = {
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
  currentColor: string;
};

const MaterialYouContext = createContext<MaterialYouContextValue | undefined>(undefined);

/**
 * Loads the saved theme color from storage and exposes Material 3 colors
 * to the rest of the app
 */
export function MaterialYouProvider({ children }: { children: React.ReactNode }) {
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

  const updateTheme = async (color: string) => {
    setCurrentColor(color);
    await AsyncStorage.setItem(STORAGE_KEYS.themeColor, color);
  };

  const resetTheme = async () => {
    setCurrentColor(MATERIAL_YOU_KEY);
    await AsyncStorage.setItem(STORAGE_KEYS.themeColor, MATERIAL_YOU_KEY);
  };

  if (isLoading || currentColor === null) return null;

  return (
    <MaterialYouContext.Provider value={{ updateTheme, resetTheme, currentColor }}>
      {children}
    </MaterialYouContext.Provider>
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
  const { currentColor } = useMaterial3ThemeContext();
  const colorScheme = useColorScheme();
  
  // Use expo-ui native material colors
  // If currentColor is not MATERIAL_YOU_KEY, pass it as seedColor
  return useMaterialColors({
    colorScheme: colorScheme ?? "light",
    seedColor: currentColor === MATERIAL_YOU_KEY ? undefined : currentColor,
  });
}

