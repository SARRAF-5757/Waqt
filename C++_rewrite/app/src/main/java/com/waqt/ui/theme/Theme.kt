/**
 * File Role: Configures Jetpack Compose Material 3 Theme with dynamic color and custom accent options.
 */
package com.waqt.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF2C3E5A),
    onPrimaryContainer = DarkOnBackground,
    background = DarkBackground,
    onBackground = DarkOnBackground,
    surface = DarkSurface,
    onSurface = DarkOnSurface,
    surfaceContainer = DarkSurfaceContainer,
    onSurfaceVariant = DarkOnSurfaceVariant
)

private val LightColorScheme = lightColorScheme(
    primary = LightPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD6E4FF),
    onPrimaryContainer = LightOnBackground,
    background = LightBackground,
    onBackground = LightOnBackground,
    surface = LightSurface,
    onSurface = LightOnSurface,
    surfaceContainer = LightSurfaceContainer,
    onSurfaceVariant = LightOnSurfaceVariant
)

/**
 * RME:
 * Reads: System dark mode setting, themeColor string ("Material You" or hex).
 * Modifies: Compose MaterialTheme ColorScheme.
 * Effects: Provides active Material 3 colors to all child Composables.
 */
@Composable
fun WaqtTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    themeColor: String = "Material You",
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val colorScheme = when {
        themeColor == "Material You" && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        themeColor.startsWith("#") -> {
            val parsedColor = try {
                Color(android.graphics.Color.parseColor(themeColor))
            } catch (e: Exception) {
                if (darkTheme) DarkPrimary else LightPrimary
            }
            if (darkTheme) {
                DarkColorScheme.copy(
                    primary = parsedColor,
                    primaryContainer = parsedColor.copy(alpha = 0.3f)
                )
            } else {
                LightColorScheme.copy(
                    primary = parsedColor,
                    primaryContainer = parsedColor.copy(alpha = 0.2f)
                )
            }
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
