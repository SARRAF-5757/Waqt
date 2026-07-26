/**
 * File Role: Home screen UI displaying today's 5 daily prayer cards with checkboxes and start/end time pills.
 */
package com.waqt.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.R
import com.waqt.ui.viewmodels.HomeViewModel
import java.text.SimpleDateFormat
import java.util.*

data class PrayerCardModel(
    val id: String,
    val name: String,
    val isCompleted: Boolean,
    val startSec: Long,
    val endSec: Long
)

/**
 * RME:
 * Reads: `HomeViewModel` StateFlow `homeState` and system dark mode.
 * Modifies: None.
 * Effects: Renders today's prayer list layout with brand header and interactive prayer cards.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    val homeState by viewModel.homeState.collectAsState()
    val isDark = isSystemInDarkTheme()

    val logoRes = if (isDark) R.drawable.splash_icon_light else R.drawable.splash_icon_dark

    val state = homeState

    val prayers = if (state != null) {
        listOf(
            PrayerCardModel("fajr", "Fajr", state.fajrCompleted, state.fajrStartSec, state.fajrEndSec),
            PrayerCardModel("dhuhr", "Dhuhr", state.dhuhrCompleted, state.dhuhrStartSec, state.dhuhrEndSec),
            PrayerCardModel("asr", "Asr", state.asrCompleted, state.asrStartSec, state.asrEndSec),
            PrayerCardModel("maghrib", "Maghrib", state.maghribCompleted, state.maghribStartSec, state.maghribEndSec),
            PrayerCardModel("isha", "Isha", state.ishaCompleted, state.ishaStartSec, state.ishaEndSec)
        )
    } else {
        listOf(
            PrayerCardModel("fajr", "Fajr", false, 0, 0),
            PrayerCardModel("dhuhr", "Dhuhr", false, 0, 0),
            PrayerCardModel("asr", "Asr", false, 0, 0),
            PrayerCardModel("maghrib", "Maghrib", false, 0, 0),
            PrayerCardModel("isha", "Isha", false, 0, 0)
        )
    }

    val showStartTime = state?.showStartTime ?: true
    val showEndTime = state?.showEndTime ?: true

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(bottom = 120.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(26.dp))

        // Centered brand logo ~180x180dp
        Image(
            painter = painterResource(id = logoRes),
            contentDescription = "Waqt Logo",
            modifier = Modifier.size(180.dp)
        )

        Spacer(modifier = Modifier.height(26.dp))

        // Render 5 daily prayer cards
        prayers.forEach { prayer ->
            PrayerCardRow(
                prayer = prayer,
                showStartTime = showStartTime,
                showEndTime = showEndTime,
                onToggle = { viewModel.togglePrayer(prayer.id) }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

/**
 * RME:
 * Reads: `PrayerCardModel`, showStartTime, showEndTime flags.
 * Modifies: None.
 * Effects: Invokes `onToggle` callback when prayer card row is clicked.
 */
@Composable
fun PrayerCardRow(
    prayer: PrayerCardModel,
    showStartTime: Boolean,
    showEndTime: Boolean,
    onToggle: () -> Unit
) {
    val cardBg = if (prayer.isCompleted) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainer
    val cardContentColor = if (prayer.isCompleted) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface

    fun formatTime(sec: Long): String {
        if (sec <= 0) return "--:--"
        val sdf = SimpleDateFormat("h:mm a", Locale.getDefault())
        return sdf.format(Date(sec * 1000L))
    }

    val startTimeStr = formatTime(prayer.startSec)
    val endTimeStr = formatTime(prayer.endSec)

    Card(
        onClick = onToggle,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = cardBg,
            contentColor = cardContentColor
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = prayer.isCompleted,
                onCheckedChange = { onToggle() },
                colors = CheckboxDefaults.colors(
                    checkedColor = MaterialTheme.colorScheme.primary,
                    uncheckedColor = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = prayer.name,
                style = MaterialTheme.typography.bodyLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold),
                modifier = Modifier.weight(1f)
            )

            Row(verticalAlignment = Alignment.CenterVertically) {
                if (showStartTime) {
                    TimePill(timeStr = startTimeStr)
                }
                if (showStartTime && showEndTime) {
                    Text(
                        text = " — ",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black)
                    )
                }
                if (showEndTime) {
                    TimePill(timeStr = endTimeStr)
                }
            }
        }
    }
}

/**
 * RME:
 * Reads: Formatted time string.
 * Modifies: None.
 * Effects: Renders styled time pill container.
 */
@Composable
fun TimePill(timeStr: String) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier.clip(RoundedCornerShape(8.dp))
    ) {
        Text(
            text = timeStr,
            style = MaterialTheme.typography.labelMedium.copy(fontSize = 15.sp, fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            textAlign = TextAlign.Center
        )
    }
}
