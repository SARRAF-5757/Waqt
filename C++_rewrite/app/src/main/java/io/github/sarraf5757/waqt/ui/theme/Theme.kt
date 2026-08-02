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
        val tintedOn = Color.White.blend(accent, 0.12f)
        
        darkColorScheme(
            primary = highlight,
            onPrimary = Color.Black,
            primaryContainer = darkBg.blend(accent, 0.45f),
            onPrimaryContainer = Color.White.blend(accent, 0.20f),
            secondary = mutedAccent,
            onSecondary = Color.Black,
            secondaryContainer = darkBg.blend(mutedAccent, 0.30f),
            onSecondaryContainer = highlight,
            tertiary = mutedAccent.copy(alpha = 0.5f),
            background = darkBg,
            onBackground = tintedOn,
            surface = darkBg,
            onSurface = tintedOn,
            surfaceContainer = darkBg.blend(accent, 0.10f),
            surfaceVariant = darkBg.blend(accent, 0.08f),
            onSurfaceVariant = tintedOn.copy(alpha = 0.75f)
        )
    } else {
        val lightBg = ColorLightBase.blend(accent, 0.06f)
        val highlight = accent.blend(Color.DarkGray, 0.35f)
        val tintedOn = Color.Black.blend(accent, 0.12f)
        
        lightColorScheme(
            primary = highlight,
            onPrimary = Color.White,
            primaryContainer = lightBg.blend(accent, 0.45f),
            onPrimaryContainer = Color.Black.blend(accent, 0.20f),
            secondary = mutedAccent,
            onSecondary = Color.White,
            secondaryContainer = lightBg.blend(mutedAccent, 0.20f),
            onSecondaryContainer = highlight,
            tertiary = mutedAccent.copy(alpha = 0.5f),
            background = lightBg,
            onBackground = tintedOn,
            surface = lightBg,
            onSurface = tintedOn,
            surfaceContainer = lightBg.blend(accent, 0.10f),
            surfaceVariant = lightBg.blend(accent, 0.06f),
            onSurfaceVariant = tintedOn.copy(alpha = 0.65f)
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
