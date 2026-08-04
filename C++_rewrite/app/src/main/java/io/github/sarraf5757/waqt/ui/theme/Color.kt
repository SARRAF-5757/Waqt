// Defines visual color tokens and palettes for the application theme

package io.github.sarraf5757.waqt.ui.theme

import androidx.compose.ui.graphics.Color

import io.github.sarraf5757.waqt.R

val ColorDarkBase = Color(0xFF050505)
val ColorLightBase = Color(0xFFFCFCFC)
val ColorPrimaryDefault = Color(0xFF007AFF)

data class ThemeColorOption(
    val nameRes: Int,
    val hexString: String,
    val color: Color,
)

val THEME_ACCENT_OPTIONS = listOf(
    ThemeColorOption(R.string.color_purple, "#AF52DE", Color(0xFF9356FF)),
    ThemeColorOption(R.string.color_blue, "#007AFF", Color(0xFF57A4FF)),
    ThemeColorOption(R.string.color_teal, "#5AC8FA", Color(0xFF5AFAED)),
    ThemeColorOption(R.string.color_green, "#34C759", Color(0xFF34C759)),
    ThemeColorOption(R.string.color_yellow, "#FFCC00", Color(0xFFFFCC00)),
    ThemeColorOption(R.string.color_red, "#FF3B30", Color(0xFFFF3030)),
)
