/**
 * Root layout for the whole app.
 *
 * 1. HabitProvider       - prayer completion history
 * 2. PrayerTimesProvider - today's prayer times from GPS
 * 3. MaterialYouProvider - theme colors (Android Material You)
 * 4. ThemeProvider       - navigation light/dark theme
 */
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "react-native";
import { HabitProvider } from "@/providers/habitProvider";
import { MaterialYouProvider } from "@/providers/materialYouProvider";
import { PrayerTimesProvider } from "@/providers/prayerTimesProvider";

SplashScreen.preventAutoHideAsync(); // prevent splash screen from hiding before loading's complete

export default function RootLayout() {
  //* ----------------------------- JS ----------------------------- *//
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

  //* --------------------------- RETURN --------------------------- *//
  return (
    <>
      {/* Global SafeArea context */}
      <SafeAreaProvider>
        {/* Habit tracking context */}
        <HabitProvider>
          {/* GPS Prayer times context */}
          <PrayerTimesProvider>
            {/* Material You dynamic colors context */}
            <MaterialYouProvider>
              {/* React Navigation theme context */}
              <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                {/* Main Routing Stack */}
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </ThemeProvider>
            </MaterialYouProvider>
          </PrayerTimesProvider>
        </HabitProvider>
      </SafeAreaProvider>
    </>
  );
}
