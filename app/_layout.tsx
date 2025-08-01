import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Material3ThemeProvider } from '@/providers/materialYouProvider';
import { HabitProvider } from "@/providers/habitProvider";
import { SystemUIHandler } from '@/components/SystemUIHandler';

// prevent splash screen from hiding before loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();

	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);


	if (!loaded) {
		return null;
	}

return (
    <SafeAreaProvider>
      <HabitProvider>
        <Material3ThemeProvider>
          <SystemUIHandler />
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" translucent={true} />
          </ThemeProvider>
        </Material3ThemeProvider>
      </HabitProvider>
    </SafeAreaProvider>
  );
}
