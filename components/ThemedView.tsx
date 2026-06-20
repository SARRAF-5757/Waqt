import { View, type ViewProps, useColorScheme } from "react-native";

import { useThemeColors } from "@/hooks/useThemeColors";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

/**
 * Basic themed container. Prefer PlatformScreen / PlatformCard for full screens and cards.
 */
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  //* ----------------------------- JS ----------------------------- *//
  const colorScheme = useColorScheme();
  const colors = useThemeColors();

  const backgroundColor =
    colorScheme === "dark"
      ? darkColor ?? lightColor ?? colors.background
      : lightColor ?? darkColor ?? colors.background;

  //* --------------------------- RETURN --------------------------- *//
  // Render a React Native View with dynamic theme colors
  return (
    <View style={[{ backgroundColor }, style]} {...otherProps} />
  );
}
