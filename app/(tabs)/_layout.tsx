import React from "react";
import { Platform, View } from "react-native";
import { withLayoutContext } from "expo-router";
import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";

import { useThemeColors } from "@/hooks/useThemeColors";

const NativeTabs = withLayoutContext(createNativeBottomTabNavigator().Navigator);

/**
 * Bottom tab navigation shared by Home, History, and Settings.
 */
export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <NativeTabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        headerShown: false,
        tabBarControllerMode: 'tabBar',
        tabBarStyle: Platform.OS === 'android' ? { backgroundColor: colors.surfaceDim || colors.surfaceVariant } : undefined,
      }}
    >
      <NativeTabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: Platform.select({
            ios: { type: 'sfSymbol', name: 'house' },
            android: { type: 'drawableResource', name: 'ic_menu_home' }
          }),
        }}
      />
      <NativeTabs.Screen
        name="streak"
        options={{
          title: "History",
          tabBarIcon: Platform.select({
            ios: { type: 'sfSymbol', name: 'chart.bar' },
            android: { type: 'drawableResource', name: 'ic_menu_recent_history' }
          }),
        }}
      />
      <NativeTabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: Platform.select({
            ios: { type: 'sfSymbol', name: 'gearshape' },
            android: { type: 'drawableResource', name: 'ic_menu_preferences' }
          }),
        }}
      />
    </NativeTabs>
  );
}
