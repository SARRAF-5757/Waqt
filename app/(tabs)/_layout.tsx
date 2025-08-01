import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from '@/hooks/useThemeColors';
import { HabitProvider } from "@/providers/habitProvider";

export default function TabLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <HabitProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.surfaceTint,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.outlineVariant,
            paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
            height: Platform.OS === 'android' ? 50 + insets.bottom : 50,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <AntDesign name="home" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="streak"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => <AntDesign name="barschart" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <AntDesign name="setting" size={30} color={color} />,
          }}
        />
      </Tabs>
    </HabitProvider>
  );
}
