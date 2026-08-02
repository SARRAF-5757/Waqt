/**
 * Home screen UI displaying prayer times task list
 */

package io.github.sarraf5757.waqt.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.ui.theme.RobotoMonoFontFamily
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
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 26.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            // Brand logo
            Image(
                painter = painterResource(id = logoRes),
                contentDescription = stringResource(R.string.waqt_logo_desc),
                modifier = Modifier.size(180.dp),
                colorFilter = ColorFilter.tint(MaterialTheme.colorScheme.primary)
            )
            
            // Extra gap after logo
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Render each prayer card efficiently
        items(prayers) { prayer ->
            PrayerCardRow(
                prayer = prayer,
                showStartTime = showStartTime,
                showEndTime = showEndTime,
                onToggle = { viewModel.togglePrayer(prayer.id) }
            )
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
    ) {
        CompositionLocalProvider(LocalMinimumInteractiveComponentSize provides 0.dp) {
            ListItem(
                headlineContent = {
                    Text(
                        text = prayer.name,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                },
                leadingContent = {
                    Checkbox(
                        checked = prayer.isCompleted,
                        onCheckedChange = null,
                        colors = CheckboxDefaults.colors(
                            checkedColor = MaterialTheme.colorScheme.primary,
                            uncheckedColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                },
                trailingContent = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (showStartTime) {
                            TimePill(timeStr = prayer.startTimeStr)
                        }
                        if (showStartTime && showEndTime) {
                            Text(
                                text = " — ",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.Black,
                                    fontFamily = RobotoMonoFontFamily
                                )
                            )
                        }
                        if (showEndTime) {
                            TimePill(timeStr = prayer.endTimeStr)
                        }
                    }
                },
                colors = ListItemDefaults.colors(
                    containerColor = Color.Transparent,
                    headlineColor = cardContentColor,
                    leadingIconColor = cardContentColor,
                    trailingIconColor = cardContentColor
                ),
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 8.dp)
            )
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
    ) {
        Text(
            text = timeStr,
            style = MaterialTheme.typography.labelMedium.copy(
                fontSize = 15.sp,
                fontWeight = FontWeight.Black,
                fontFamily = RobotoMonoFontFamily
            ),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
