import React from "react";
import { Tabs } from "expo-router";
import { Feather, AntDesign } from "@expo/vector-icons";

import { useThemeColors } from '@/hooks/useThemeColors';
import { HapticTab } from "@/components/HapticTab";

export default function TabLayout() {
  const colors = useThemeColors();

  return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.surfaceTint,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: colors.surfaceDim,
            borderTopColor: colors.outlineVariant,
            paddingTop: 10,
            height: 85,
            paddingBottom: 10,
          },
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Feather name="home" size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="streak"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => <AntDesign name="bar-chart" size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <Feather name="settings" size={26} color={color} />,
          }}
        />
      </Tabs>
  );
}
