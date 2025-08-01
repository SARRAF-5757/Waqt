import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMaterial3Colors } from '@/providers/materialYouProvider';

export function SystemUIHandler() {
  const colorScheme = useColorScheme();
  const colors = useMaterial3Colors();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set root background color to match Material3 theme
      SystemUI.setBackgroundColorAsync(colors.background);
      
      // Configure navigation bar for edge-to-edge
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setBorderColorAsync('transparent');
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
    }
  }, [colorScheme, colors.background]);

  return null;
}
