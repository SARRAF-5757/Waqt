import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColors } from "@/hooks/useThemeColors";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

/**
 * Basic themed container. Prefer PlatformScreen / PlatformCard for full screens and cards.
 */
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // ^ JS -------------------------------------------------------------------
  const colorScheme = useColorScheme();
  const colors = useThemeColors();

  const backgroundColor =
    colorScheme === "dark"
      ? darkColor ?? lightColor ?? colors.background
      : lightColor ?? darkColor ?? colors.background;

  // ^ RETURN ---------------------------------------------------------------
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

// ^ STYLING ---------------------------------------------------------------
// This component uses inline backgroundColor only. No StyleSheet needed here.
