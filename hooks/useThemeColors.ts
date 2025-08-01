import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useMaterial3Colors } from '@/providers/materialYouProvider';

export function useThemeColors() {
    const colorScheme = useColorScheme() ?? 'light';
    const material3Colors = useMaterial3Colors();
    const fallbackColors = Colors[colorScheme];

    return {
        // Material 3 primary colors
        primary: material3Colors.primary,
        onPrimary: material3Colors.onPrimary,
        primaryContainer: material3Colors.primaryContainer,
        onPrimaryContainer: material3Colors.onPrimaryContainer,
        
        // Material 3 secondary colors
        secondary: material3Colors.secondary,
        onSecondary: material3Colors.onSecondary,
        secondaryContainer: material3Colors.secondaryContainer,
        onSecondaryContainer: material3Colors.onSecondaryContainer,
        
        // Material 3 tertiary colors
        tertiary: material3Colors.tertiary,
        onTertiary: material3Colors.onTertiary,
        tertiaryContainer: material3Colors.tertiaryContainer,
        onTertiaryContainer: material3Colors.onTertiaryContainer,
        
        // Material 3 error colors
        error: material3Colors.error,
        onError: material3Colors.onError,
        errorContainer: material3Colors.errorContainer,
        onErrorContainer: material3Colors.onErrorContainer,
        
        // Material 3 surface colors
        surface: material3Colors.surface,
        onSurface: material3Colors.onSurface,
        surfaceVariant: material3Colors.surfaceVariant,
        onSurfaceVariant: material3Colors.onSurfaceVariant,
        surfaceTint: material3Colors.surfaceTint,
        
        // Material 3 background colors
        background: material3Colors.background,
        onBackground: material3Colors.onBackground,
        
        // Material 3 outline colors
        outline: material3Colors.outline,
        outlineVariant: material3Colors.outlineVariant,
        
        // Fallback colors for compatibility
        text: fallbackColors.text,
        tint: fallbackColors.tint,
        icon: fallbackColors.icon,
        tabIconDefault: fallbackColors.tabIconDefault,
        tabIconSelected: fallbackColors.tabIconSelected,
    };
}
