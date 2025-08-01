import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useMaterial3Theme, Material3Theme } from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Material3ThemeProviderProps = {
  theme: Material3Theme;
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
};

const Material3ThemeProviderContext = createContext<Material3ThemeProviderProps>({} as Material3ThemeProviderProps);

interface Material3ThemeProviderComponentProps {
  children: ReactNode;
  sourceColor?: string;
  fallbackSourceColor?: string;
}

const THEME_STORAGE_KEY = '@waqt_theme_color';

export function Material3ThemeProvider({ 
  children, 
  sourceColor, 
  fallbackSourceColor = '#4F8EF7'
}: Material3ThemeProviderComponentProps) {
  const [persistedColor, setPersistedColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted theme color on app start
  useEffect(() => {
    const loadPersistedTheme = async () => {
      try {
        const savedColor = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        console.log('Material3ThemeProvider: Loaded color from storage:', savedColor);
        if (savedColor) {
          setPersistedColor(savedColor);
        }
      } catch (error) {
        console.warn('Failed to load persisted theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedTheme();
  }, []);

  const { theme, updateTheme: originalUpdateTheme, resetTheme: originalResetTheme } = useMaterial3Theme({
    sourceColor: persistedColor || sourceColor,
    fallbackSourceColor,
  });

  // Enhanced updateTheme that persists the color
  const updateTheme = async (color: string) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, color);
      console.log('Material3ThemeProvider: Saved color to storage:', color);
      setPersistedColor(color);
      originalUpdateTheme(color);
    } catch (error) {
      console.warn('Failed to persist theme color:', error);
      // Still update the theme even if persistence fails
      originalUpdateTheme(color);
    }
  };

  // Enhanced resetTheme that clears persisted color
  const resetTheme = async () => {
    try {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      console.log('Material3ThemeProvider: Removed color from storage');
      setPersistedColor(null);
      originalResetTheme();
    } catch (error) {
      console.warn('Failed to clear persisted theme:', error);
      // Still reset the theme even if clearing storage fails
      originalResetTheme();
    }
  };

  // Don't render until we've loaded the persisted theme
  if (isLoading) {
    return null;
  }

  return (
    <Material3ThemeProviderContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </Material3ThemeProviderContext.Provider>
  );
}

export function useMaterial3ThemeContext() {
  const context = useContext(Material3ThemeProviderContext);
  if (!context) {
    throw new Error('useMaterial3ThemeContext must be used inside Material3ThemeProvider');
  }
  return context;
}

// Hook to get the current Material 3 colors for the current color scheme
export function useMaterial3Colors() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3ThemeContext();
  
  return theme[colorScheme ?? 'light'];
}
