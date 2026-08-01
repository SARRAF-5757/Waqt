// Configures Material 3 theme with dynamic and custom color support

package io.github.sarraf5757.waqt.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalContext
import androidx.core.graphics.toColorInt

/**
 * Provides active Material 3 colors to all child Composables
 */
@Composable
fun WaqtTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    themeColor: String = "Material You",
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    
    val colorScheme = when {
        // Option 1: Material You
        (themeColor == "Material You") && (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        
        // Option 2: Custom Hex Color
        themeColor.startsWith("#") -> {
            val parsedColor = try {
                Color(themeColor.toColorInt())
            } catch (_: Exception) {
                ColorPrimaryDefault
            }
            createWaqtColorScheme(parsedColor, darkTheme)
        }
        
        // Option 3: Default App Blue
        else -> createWaqtColorScheme(ColorPrimaryDefault, darkTheme)
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

/**
 * Generate color scheme from custom accent colors
 */
private fun createWaqtColorScheme(accent: Color, isDark: Boolean): ColorScheme {
    val mutedAccent = accent.desaturate(0.6f)
    
    return if (isDark) {
        val darkBg = ColorDarkBase.blend(accent, 0.06f)
        val highlight = accent.blend(Color.LightGray, 0.70f)
        
        darkColorScheme(
            primary = highlight,
            onPrimary = Color.Black,
            primaryContainer = darkBg.blend(accent, 0.35f),
            onPrimaryContainer = DarkOnBackground, // Re-using standard dark neutrals
            secondary = mutedAccent,
            onSecondary = Color.Black,
            secondaryContainer = darkBg.blend(mutedAccent, 0.30f),
            onSecondaryContainer = highlight,
            tertiary = mutedAccent.copy(alpha = 0.5f),
            background = darkBg,
            onBackground = DarkOnBackground,
            surface = darkBg,
            onSurface = DarkOnSurface,
            surfaceContainer = darkBg.blend(accent, 0.05f),
            surfaceVariant = darkBg.blend(accent, 0.08f),
            onSurfaceVariant = DarkOnSurfaceVariant
        )
    } else {
        val lightBg = ColorLightBase.blend(accent, 0.06f)
        val highlight = accent.blend(Color.DarkGray, 0.35f)
        
        lightColorScheme(
            primary = highlight,
            onPrimary = Color.White,
            primaryContainer = lightBg.blend(accent, 0.25f),
            onPrimaryContainer = LightOnBackground,
            secondary = mutedAccent,
            onSecondary = Color.White,
            secondaryContainer = lightBg.blend(mutedAccent, 0.20f),
            onSecondaryContainer = highlight,
            tertiary = mutedAccent.copy(alpha = 0.5f),
            background = lightBg,
            onBackground = LightOnBackground,
            surface = lightBg,
            onSurface = LightOnSurface,
            surfaceContainer = lightBg.blend(accent, 0.08f),
            surfaceVariant = lightBg.blend(accent, 0.06f), // Consistent with your rejected/accepted ratio
            onSurfaceVariant = LightOnSurfaceVariant
        )
    }
}

// ---  Helper Functions ---
private fun Color.blend(other: Color, amount: Float): Color = lerp(this, other, amount)

private fun Color.desaturate(amount: Float): Color {
    val l = luminance()
    val gray = Color(l, l, l, alpha)
    return lerp(this, gray, amount)
}
