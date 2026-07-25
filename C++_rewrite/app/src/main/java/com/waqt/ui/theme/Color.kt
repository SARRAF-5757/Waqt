/**
 * File Role: Defines visual color tokens, fallback palettes, and accent options for Material 3.
 */
package com.waqt.ui.theme

import androidx.compose.ui.graphics.Color

val LightPrimary = Color(0xFF4F8EF7)
val LightBackground = Color(0xFFFFFFFF)
val LightOnBackground = Color(0xFF11181C)
val LightSurfaceContainer = Color(0xFFF2F2F7)
val LightSurface = Color(0xFFFFFFFF)
val LightOnSurface = Color(0xFF11181C)
val LightOnSurfaceVariant = Color(0xFF687076)

val DarkPrimary = Color(0xFF85B1FF)
val DarkBackground = Color(0xFF151718)
val DarkOnBackground = Color(0xFFECEDEE)
val DarkSurfaceContainer = Color(0xFF1C1C1E)
val DarkSurface = Color(0xFF151718)
val DarkOnSurface = Color(0xFFECEDEE)
val DarkOnSurfaceVariant = Color(0xFF9BA1A6)

data class ThemeColorOption(
    val name: String,
    val hexString: String,
    val color: Color
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
