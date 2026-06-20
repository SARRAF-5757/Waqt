/**
 * Root layout for the whole app.
 *
 * Provider order matters:
 * 1. HabitProvider       - prayer completion history
 * 2. PrayerTimesProvider - today's prayer times from GPS
 * 3. MaterialYouProvider - theme colors (Android Material You)
 * 4. ThemeProvider       - navigation light/dark theme
 */
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { HabitProvider } from "@/providers/habitProvider";
import { MaterialYouProvider } from "@/providers/materialYouProvider";
import { PrayerTimesProvider } from "@/providers/prayerTimesProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // ^ JS -------------------------------------------------------------------
  const colorScheme = useColorScheme();

  // Load the custom font before showing the app UI.
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Hide the splash screen once fonts are ready.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // ^ RETURN ---------------------------------------------------------------
  return (
    <SafeAreaProvider>
      <HabitProvider>
        <PrayerTimesProvider>
          <MaterialYouProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </MaterialYouProvider>
        </PrayerTimesProvider>
      </HabitProvider>
    </SafeAreaProvider>
  );
}

// ^ STYLING ---------------------------------------------------------------
// Root layout has no local StyleSheet. Screen styling lives in each tab file.
