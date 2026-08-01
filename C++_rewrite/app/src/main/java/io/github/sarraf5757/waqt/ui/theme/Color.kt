// Defines visual color tokens and palettes for the application theme

package io.github.sarraf5757.waqt.ui.theme

import androidx.compose.ui.graphics.Color

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
    val name: String,
    val hexString: String,
    val color: Color,
)

val THEME_ACCENT_OPTIONS = listOf(
    ThemeColorOption("Blue", "#007AFF", Color(0xFF007AFF)),
    ThemeColorOption("Green", "#34C759", Color(0xFF34C759)),
    ThemeColorOption("Indigo", "#5856D6", Color(0xFF5856D6)),
    ThemeColorOption("Orange", "#FF9500", Color(0xFFFF9500)),
    ThemeColorOption("Purple", "#AF52DE", Color(0xFFAF52DE)),
    ThemeColorOption("Red", "#FF3B30", Color(0xFFFF3B30)),
    ThemeColorOption("Teal", "#5AC8FA", Color(0xFF5AC8FA)),
    ThemeColorOption("Yellow", "#FFCC00", Color(0xFFFFCC00))
)
