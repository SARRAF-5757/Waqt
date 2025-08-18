import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useMaterial3Theme, Material3Theme } from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MaterialYouProviderProps = {
  theme: Material3Theme;
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
  currentColor: string | null;
};

// The context object (initially empty)
const MaterialYouProviderContext = createContext<MaterialYouProviderProps>({} as MaterialYouProviderProps);

interface MaterialYouProviderComponentProps {
  children: ReactNode;
  sourceColor?: string;
  fallbackSourceColor?: string;
}

const THEME_STORAGE_KEY = '@waqt_theme_color';
const MATERIAL_YOU_KEY = 'MATERIAL_YOU'; // Special key to indicate Material You mode

// Inner component that handles the theme library after we know the correct color
function MaterialYouProviderLoaded({ 
  children, 
  initialColor, 
  fallbackSourceColor,
  onUpdateTheme,
  onResetTheme
}: {
  children: ReactNode;
  initialColor: string;
  fallbackSourceColor: string;
  onUpdateTheme: (color: string) => Promise<void>;
  onResetTheme: () => Promise<void>;
}) {
  // Check if we should use Material You (system colors) or a specific color
  const isMaterialYou = initialColor === MATERIAL_YOU_KEY;
  
  // Now we can safely initialize the theme library with the correct color
  const { theme, updateTheme: libUpdateTheme, resetTheme: libResetTheme } = useMaterial3Theme({
    sourceColor: isMaterialYou ? undefined : initialColor, // undefined lets library extract system colors
    fallbackSourceColor,
  });

  // Wrapper functions that call both library and persistence logic
  const updateTheme = async (color: string) => {
    libUpdateTheme(color);
    await onUpdateTheme(color);
  };

  const resetTheme = async () => {
    libResetTheme();
    await onResetTheme();
  };

  return (
    <MaterialYouProviderContext.Provider value={{ 
      theme, 
      updateTheme, 
      resetTheme,
      currentColor: initialColor
    }}>
      {children}
    </MaterialYouProviderContext.Provider>
  );
}

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
          // Default to Material You mode for new users
          setCurrentColor(MATERIAL_YOU_KEY);
        }
      } catch (error) {
        console.warn('Failed to load persisted theme:', error);
        // Fallback to Material You mode on error
        setCurrentColor(MATERIAL_YOU_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedTheme();
  }, [sourceColor, fallbackSourceColor]);

  // Enhanced updateTheme that persists the color in AsyncStorage
  const handleUpdateTheme = async (color: string) => {
    try {
      setCurrentColor(color);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, color);
    } catch (error) {
      console.warn('Failed to persist theme color:', error);
      // Still update the color for UI, even if persistence fails
      setCurrentColor(color);
    }
  };

  // Enhanced resetTheme that clears persisted color and sets Material You mode
  const handleResetTheme = async () => {
    try {
      // Store Material You key instead of removing the key entirely
      await AsyncStorage.setItem(THEME_STORAGE_KEY, MATERIAL_YOU_KEY);
      setCurrentColor(MATERIAL_YOU_KEY);
    } catch (error) {
      console.warn('Failed to reset to Material You theme:', error);
      // Fallback: still set Material You mode even if storage fails
      setCurrentColor(MATERIAL_YOU_KEY);
    }
  };

  // Don't render children until we've loaded the persisted theme
  if (isLoading || currentColor === null) {
    return null;
  }

  // Now render the loaded component with the correct initial color
  return (
    <MaterialYouProviderLoaded
      initialColor={currentColor}
      fallbackSourceColor={fallbackSourceColor}
      onUpdateTheme={handleUpdateTheme}
      onResetTheme={handleResetTheme}
    >
      {children}
    </MaterialYouProviderLoaded>
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
