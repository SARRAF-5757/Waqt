import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useThemeColors } from "@/hooks/useThemeColors";

/**
 * Bottom tab navigation shared by Home, History, and Settings.
 */
export default function TabLayout() {
  //* ----------------------------- JS ----------------------------- *//
  const colors = useThemeColors();

  //* --------------------------- RETURN --------------------------- *//
  return (
    <NativeTabs
      tintColor={colors.tabIconSelected}
      indicatorColor={colors.secondaryContainer}
      iconColor={{ default: colors.onSurfaceVariant, selected: colors.onSecondaryContainer }}
      labelStyle={{ default: { color: colors.onSurfaceVariant }, selected: { color: colors.onSurface } }}
      backgroundColor={colors.surfaceContainer}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon drawable="ic_menu_home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="streak">
        <NativeTabs.Trigger.Icon drawable="ic_menu_recent_history" />
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon drawable="ic_menu_preferences" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
