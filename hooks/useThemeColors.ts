import { Platform } from "react-native";

import { useColorScheme } from "react-native";
import { Colors, IOSColors } from "@/constants/Colors";
import { useMaterial3Colors } from "@/providers/materialYouProvider";

/**
 * Returns the active color palette for the current light/dark mode.
 * Android uses Material You. iOS uses app-defined colors.
 */
//* ----------------------------- JS ----------------------------- *//
export function useThemeColors() {
  const colorScheme = useColorScheme() ?? "light";
  const material3Colors = useMaterial3Colors();
  const fallbackColors = Colors[colorScheme];
  const iosColors = IOSColors[colorScheme];

  if (Platform.OS === "ios") {
    return {
      primary: material3Colors.primary,
      onPrimary: "#FFFFFF",
      primaryContainer: material3Colors.primaryContainer,
      onPrimaryContainer: material3Colors.onPrimaryContainer,

      secondary: material3Colors.primary,
      onSecondary: "#FFFFFF",
      secondaryContainer: material3Colors.secondaryContainer,
      onSecondaryContainer: material3Colors.onSecondaryContainer,

      tertiary: material3Colors.primary,
      onTertiary: "#FFFFFF",
      tertiaryContainer: material3Colors.tertiaryContainer,
      onTertiaryContainer: material3Colors.onTertiaryContainer,

      error: "#FF3B30",
      onError: "#FFFFFF",
      errorContainer: "#FF3B301A",
      onErrorContainer: "#FF3B30",

      surface: iosColors.groupedBackground,
      onSurface: iosColors.label,
      surfaceVariant: iosColors.secondaryGroupedBackground,
      onSurfaceVariant: iosColors.secondaryLabel,
      surfaceTint: material3Colors.primary,
      surfaceDim: iosColors.background,
      surfaceBright: iosColors.groupedBackground,
      surfaceContainer: iosColors.secondaryGroupedBackground,
      surfaceContainerHigh: iosColors.groupedBackground,
      surfaceContainerHighest: iosColors.groupedBackground,

      background: iosColors.background,
      onBackground: iosColors.label,

      outline: iosColors.separator,
      outlineVariant: iosColors.separator,

      text: iosColors.label,
      tint: material3Colors.primary,
      icon: iosColors.secondaryLabel,
      tabIconDefault: iosColors.tertiaryLabel,
      tabIconSelected: material3Colors.primary,
    };
  }

  return {
    primary: material3Colors.primary,
    onPrimary: material3Colors.onPrimary,
    primaryContainer: material3Colors.primaryContainer,
    onPrimaryContainer: material3Colors.onPrimaryContainer,

    secondary: material3Colors.secondary,
    onSecondary: material3Colors.onSecondary,
    secondaryContainer: material3Colors.secondaryContainer,
    onSecondaryContainer: material3Colors.onSecondaryContainer,

    tertiary: material3Colors.tertiary,
    onTertiary: material3Colors.onTertiary,
    tertiaryContainer: material3Colors.tertiaryContainer,
    onTertiaryContainer: material3Colors.onTertiaryContainer,

    error: material3Colors.error,
    onError: material3Colors.onError,
    errorContainer: material3Colors.errorContainer,
    onErrorContainer: material3Colors.onErrorContainer,

    surface: material3Colors.surface,
    onSurface: material3Colors.onSurface,
    surfaceVariant: material3Colors.surfaceVariant,
    onSurfaceVariant: material3Colors.onSurfaceVariant,
    surfaceTint: material3Colors.surfaceTint,
    surfaceDim: material3Colors.surfaceDim,
    surfaceBright: material3Colors.surfaceBright,
    surfaceContainer: material3Colors.surfaceContainer,
    surfaceContainerHigh: material3Colors.surfaceContainerHigh,
    surfaceContainerHighest: material3Colors.surfaceContainerHighest,

    background: material3Colors.background,
    onBackground: material3Colors.onBackground,

    outline: material3Colors.outline,
    outlineVariant: material3Colors.outlineVariant,

    text: fallbackColors.text,
    tint: material3Colors.primary,
    icon: fallbackColors.icon,
    tabIconDefault: fallbackColors.tabIconDefault,
    tabIconSelected: material3Colors.primary,
  };
}
