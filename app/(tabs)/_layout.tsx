import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AntDesign } from "@expo/vector-icons";
import { HabitProvider } from "@/contexts/HabitContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <HabitProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarBackground: TabBarBackground,
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
