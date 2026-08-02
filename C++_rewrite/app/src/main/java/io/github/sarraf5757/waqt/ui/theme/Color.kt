// Defines visual color tokens and palettes for the application theme

package io.github.sarraf5757.waqt.ui.theme

import androidx.compose.ui.graphics.Color
import io.github.sarraf5757.waqt.R

// Base Neutral Backgrounds
val ColorDarkBase = Color(0xFF050505)
val ColorLightBase = Color(0xFFFCFCFC)

// Neutral "On" Colors (Light Mode)
val LightOnBackground = Color(0xFF11181C)
val LightOnSurface = Color(0xFF11181C)
val LightOnSurfaceVariant = Color(0xFF687076)

// Neutral "On" Colors (Dark Mode)
val DarkOnBackground = Color(0xFFECEDEE)
val DarkOnSurface = Color(0xFFECEDEE)
val DarkOnSurfaceVariant = Color(0xFF9BA1A6)

// Default Accent Colors (blue)
val ColorPrimaryDefault = Color(0xFF007AFF)

data class ThemeColorOption(
    val nameRes: Int,
    val hexString: String,
    val color: Color,
)

val THEME_ACCENT_OPTIONS = listOf(
    ThemeColorOption(R.string.color_purple, "#AF52DE", Color(0xFFAF52DE)),
    ThemeColorOption(R.string.color_indigo, "#5856D6", Color(0xFF5856D6)),
    ThemeColorOption(R.string.color_blue, "#007AFF", Color(0xFF007AFF)),
    ThemeColorOption(R.string.color_teal, "#5AC8FA", Color(0xFF5AC8FA)),
    ThemeColorOption(R.string.color_green, "#34C759", Color(0xFF34C759)),
    ThemeColorOption(R.string.color_yellow, "#FFCC00", Color(0xFFFFCC00)),
    ThemeColorOption(R.string.color_orange, "#FF9500", Color(0xFFFF9500)),
    ThemeColorOption(R.string.color_red, "#FF3B30", Color(0xFFFF3037)),
)
