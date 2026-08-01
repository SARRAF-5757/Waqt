/**
 * Home screen UI displaying prayer times task list
 */

package io.github.sarraf5757.waqt.ui.screens

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
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.ui.viewmodels.HomeViewModel

/**
 * Collects the state from the C++ core via the ViewModel
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    val homeState by viewModel.homeState.collectAsState()   /** Re-run this function whenever the C++ state changes */
    val isDark = isSystemInDarkTheme()

    val logoRes = if (isDark) R.drawable.splash_icon_light else R.drawable.splash_icon_dark

    val state = homeState
    /** Get the list of prayer objects constructed by C++ */
    val prayers = state?.prayers ?: emptyArray()

    val showStartTime = state?.showStartTime ?: true
    val showEndTime = state?.showEndTime ?: true

    /** UI layout Description */
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(bottom = 120.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(26.dp))

        // Brand logo
        Image(
            painter = painterResource(id = logoRes),
            contentDescription = "Waqt Logo",
            modifier = Modifier.size(180.dp),
            colorFilter = ColorFilter.tint(MaterialTheme.colorScheme.onSecondaryContainer)
        )

        Spacer(modifier = Modifier.height(26.dp))

        // Render each prayer card
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
 * Invokes `onToggle` callback when prayer card row is clicked
 */
@Composable
fun PrayerCardRow(
    prayer: NativeModels.UIPrayerItem,
    showStartTime: Boolean,
    showEndTime: Boolean,
    onToggle: () -> Unit
) {
    val cardBg = if (prayer.isCompleted) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainer
    val cardContentColor = if (prayer.isCompleted) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface

    Card(
        onClick = onToggle,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = cardBg,
            contentColor = cardContentColor
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
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
                    TimePill(timeStr = prayer.startTimeStr)
                }
                if (showStartTime && showEndTime) {
                    Text(
                        text = " — ",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black)
                    )
                }
                if (showEndTime) {
                    TimePill(timeStr = prayer.endTimeStr)
                }
            }
        }
    }
}

/**
 * Renders styled time pill container
 */
@Composable
fun TimePill(timeStr: String) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.background,
        modifier = Modifier.clip(RoundedCornerShape(8.dp))
    ) {
        Text(
            text = timeStr,
            style = MaterialTheme.typography.labelMedium.copy(
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                fontFamily = FontFamily.Monospace
            ),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            textAlign = TextAlign.Center
        )
    }
}
