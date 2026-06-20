import { Text, type TextProps, StyleSheet, Platform } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColors } from "@/hooks/useThemeColors";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

/**
 * Text component that automatically uses the current app theme colors.
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  // ^ JS -------------------------------------------------------------------
  const colorScheme = useColorScheme();
  const colors = useThemeColors();

  const color =
    colorScheme === "dark"
      ? darkColor ?? lightColor ?? colors.onSurface
      : lightColor ?? darkColor ?? colors.onSurface;

  // ^ RETURN ---------------------------------------------------------------
  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

// ^ STYLING ---------------------------------------------------------------
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: Platform.OS === "ios" ? 34 : 30,
    fontWeight: "bold",
    lineHeight: Platform.OS === "ios" ? 40 : 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
