import { useColorScheme } from "react-native";
import { useMaterial3Colors } from "@/providers/materialYouProvider";
import { Colors } from "@/constants/Colors";

/**
 * Returns the active Material 3 color palette for the current light/dark mode.
 */
export function useThemeColors() {
  const scheme = useColorScheme();
  const colorScheme = scheme === "dark" ? "dark" : "light";
  const material3Colors = useMaterial3Colors();
  const fallback = Colors[colorScheme];

  // In case useMaterialColors returns an empty object (e.g. Expo Go)
  const isAvailable = material3Colors && material3Colors.primary;

  // We provide a basic fallback mapping from our standard Colors
  return {
    ...material3Colors,
    
    // Core material colors fallback
    primary: isAvailable ? material3Colors.primary : fallback.tint,
    onPrimary: isAvailable ? material3Colors.onPrimary : fallback.background,
    primaryContainer: isAvailable ? material3Colors.primaryContainer : fallback.tint,
    onPrimaryContainer: isAvailable ? material3Colors.onPrimaryContainer : fallback.background,
    
    surface: isAvailable ? material3Colors.surface : fallback.background,
    onSurface: isAvailable ? material3Colors.onSurface : fallback.text,
    surfaceVariant: isAvailable ? material3Colors.surfaceVariant : (colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7"),
    onSurfaceVariant: isAvailable ? material3Colors.onSurfaceVariant : fallback.icon,
    surfaceDim: isAvailable ? material3Colors.surfaceDim : (colorScheme === "dark" ? "#1C1C1E" : "#E5E5EA"),
    surfaceContainer: isAvailable ? material3Colors.surfaceContainer : (colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7"),
    surfaceContainerLow: isAvailable ? material3Colors.surfaceContainerLow : (colorScheme === "dark" ? "#151718" : "#F8F8F8"),
    surfaceContainerHigh: isAvailable ? material3Colors.surfaceContainerHigh : (colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA"),
    
    error: isAvailable ? material3Colors.error : "#FF3B30",
    errorContainer: isAvailable ? material3Colors.errorContainer : "#FF3B3033",
    onError: isAvailable ? material3Colors.onError : "#FFFFFF",
    
    background: isAvailable ? material3Colors.background : fallback.background,
    onBackground: isAvailable ? material3Colors.onBackground : fallback.text,
    
    outline: isAvailable ? material3Colors.outline : (colorScheme === "dark" ? "#54545899" : "#3C3C434D"),

    // Custom properties expected by our components
    text: isAvailable ? material3Colors.onBackground : fallback.text,
    tint: isAvailable ? material3Colors.primary : fallback.tint,
    icon: isAvailable ? material3Colors.onSurfaceVariant : fallback.icon,
    tabIconDefault: isAvailable ? material3Colors.onSurfaceVariant : fallback.tabIconDefault,
    tabIconSelected: isAvailable ? material3Colors.primary : fallback.tabIconSelected,
  };
}
