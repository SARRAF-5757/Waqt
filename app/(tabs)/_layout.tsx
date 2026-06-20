import React from "react";
import { Platform } from "react-native";
import { withLayoutContext } from "expo-router";
import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useThemeColors } from "@/hooks/useThemeColors";

// use non native bottom navigator if on web
const TabNavigator = Platform.OS === "web" ? createBottomTabNavigator().Navigator : createNativeBottomTabNavigator().Navigator;
const Tabs = withLayoutContext(TabNavigator);

/**
 * Bottom tab navigation shared by Home, History, and Settings.
 */
export default function TabLayout() {
  //* ----------------------------- JS ----------------------------- *//
  const colors = useThemeColors();

  //* --------------------------- RETURN --------------------------- *//
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        headerShown: false,
        tabBarControllerMode: "tabBar",
        tabBarStyle: Platform.OS === "android" ? { backgroundColor: colors.surfaceDim || colors.surfaceVariant } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: Platform.select({
            ios: { type: "sfSymbol", name: "house" },
            android: { type: "drawableResource", name: "ic_menu_home" },
            default: undefined,
          }),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: "History",
          tabBarIcon: Platform.select({
            ios: { type: "sfSymbol", name: "chart.bar" },
            android: { type: "drawableResource", name: "ic_menu_recent_history" },
            default: undefined,
          }),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: Platform.select({
            ios: { type: "sfSymbol", name: "gearshape" },
            android: { type: "drawableResource", name: "ic_menu_preferences" },
            default: undefined,
          }),
        }}
      />
    </Tabs>
  );
}
