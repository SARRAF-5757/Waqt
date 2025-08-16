import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useMaterial3Theme, Material3Theme } from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MaterialYouProviderProps = {
  theme: Material3Theme;
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
};

// The context object (initially empty)
const MaterialYouProviderContext = createContext<MaterialYouProviderProps>({} as MaterialYouProviderProps);

interface MaterialYouProviderComponentProps {
  children: ReactNode;
  sourceColor?: string;
  fallbackSourceColor?: string;
}

const THEME_STORAGE_KEY = '@waqt_theme_color';

export function MaterialYouProvider({ 
  children, 
  sourceColor, 
  fallbackSourceColor = '#4F8EF7'
}: MaterialYouProviderComponentProps) {
  // State: the current source color and loading status
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, load the persisted theme color from AsyncStorage (if any)
  useEffect(() => {
    const loadPersistedTheme = async () => {
      try {
        const savedColor = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedColor) {
          setCurrentColor(savedColor);
        } else {
          setCurrentColor(sourceColor || fallbackSourceColor);
        }
      } catch (error) {
        console.warn('Failed to load persisted theme:', error);
        setCurrentColor(sourceColor || fallbackSourceColor);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedTheme();
  }, [sourceColor, fallbackSourceColor]);

  // Get the Material 3 theme and update/reset functions from the library
  const { theme, updateTheme: originalUpdateTheme, resetTheme: originalResetTheme } = useMaterial3Theme({
    sourceColor: currentColor || sourceColor,
    fallbackSourceColor,
  });

  // Enhanced updateTheme that persists the color in AsyncStorage
  const updateTheme = async (color: string) => {
    try {
      setCurrentColor(color); // update state for UI
      originalUpdateTheme(color); // update theme in library
      await AsyncStorage.setItem(THEME_STORAGE_KEY, color); // persist
    } catch (error) {
      console.warn('Failed to persist theme color:', error);
      setCurrentColor(color);
      originalUpdateTheme(color);
    }
  };

  // Enhanced resetTheme that clears persisted color
  const resetTheme = async () => {
    try {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      const resetColor = sourceColor || fallbackSourceColor;
      setCurrentColor(resetColor);
      originalResetTheme();
    } catch (error) {
      console.warn('Failed to clear persisted theme:', error);
      const resetColor = sourceColor || fallbackSourceColor;
      setCurrentColor(resetColor);
      originalResetTheme();
    }
  };

  // Don't render children until we've loaded the persisted theme
  if (isLoading) {
    return null;
  }

  // Provide the theme and update/reset functions to all children
  return (
    <MaterialYouProviderContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </MaterialYouProviderContext.Provider>
  );
}

// Custom hook for easy access to the Material You theme context
export function useMaterial3ThemeContext() {
  const context = useContext(MaterialYouProviderContext);
  if (!context) {
    throw new Error('useMaterial3ThemeContext must be used inside MaterialYouProvider');
  }
  return context;
}

// Hook to get the current Material 3 colors for the current color scheme
// Custom hook to get the current Material 3 colors for the current color scheme
export function useMaterial3Colors() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3ThemeContext();
  return theme[colorScheme ?? 'light'];
}
