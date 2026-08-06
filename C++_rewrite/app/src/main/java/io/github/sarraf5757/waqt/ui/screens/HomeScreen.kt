/**
 * Home screen UI displaying prayer times task list
 */

package io.github.sarraf5757.waqt.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

    var prayerToUncheck by remember { mutableStateOf<NativeModels.UIPrayerItem?>(null) }
    var prayerToMarkOnTime by remember { mutableStateOf<NativeModels.UIPrayerItem?>(null) }

    val logoRes = if (isDark) R.drawable.splash_icon_light else R.drawable.splash_icon_dark

    val state = homeState
    /** Get the list of prayer objects constructed by C++ */
    val prayers = state?.prayers ?: emptyList()

    val showStartTime = state?.showStartTime ?: true
    val showEndTime = state?.showEndTime ?: true

    /** UI layout Description */
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Brand logo
        Image(
            painter = painterResource(id = logoRes),
            contentDescription = stringResource(R.string.waqt_logo_desc),
            modifier = Modifier.size(220.dp),
            colorFilter = ColorFilter.tint(MaterialTheme.colorScheme.primary)
        )

        // Render each prayer card
        prayers.forEach { prayer ->
            PrayerCardRow(
                prayer = prayer,
                showStartTime = showStartTime,
                showEndTime = showEndTime,
                onToggle = {
                    if (prayer.isCompleted && prayer.isOnTime) {
                        prayerToUncheck = prayer
                    } else {
                        viewModel.togglePrayer(prayer.id)
                    }
                },
                onMarkOnTime = {
                    prayerToMarkOnTime = prayer
                }
            )
        }
    }

    // Confirmation dialog for unchecking a prayer
    if (prayerToUncheck != null) {
        AlertDialog(
            onDismissRequest = { prayerToUncheck = null },
            title = { Text(stringResource(R.string.uncheck_prayer_title)) },
            text = { Text(stringResource(R.string.uncheck_prayer_message, prayerToUncheck!!.name)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.togglePrayer(prayerToUncheck!!.id)
                        prayerToUncheck = null
                    }
                ) {
                    Text(stringResource(R.string.confirm_uncheck))
                }
            },
            dismissButton = {
                TextButton(onClick = { prayerToUncheck = null }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }

    // Confirmation dialog for retroactively marking as on-time
    if (prayerToMarkOnTime != null) {
        AlertDialog(
            onDismissRequest = { prayerToMarkOnTime = null },
            title = { Text(stringResource(R.string.mark_on_time_title)) },
            text = { Text(stringResource((R.string.mark_on_time_message)))},
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.markAsOnTime(prayerToMarkOnTime!!.id)
                        prayerToMarkOnTime = null
                    }
                ) {
                    Text(stringResource(R.string.confirm_mark_on_time))
                }
            },
            dismissButton = {
                TextButton(onClick = { prayerToMarkOnTime = null }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
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
    onToggle: () -> Unit,
    onMarkOnTime: () -> Unit
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
                        if (prayer.isCompleted && !prayer.isOnTime) {
                            IconButton(
                                onClick = onMarkOnTime,
                                modifier = Modifier
                                    .size(32.dp)
                                    .padding(end = 8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.History,
                                    contentDescription = "Mark as on-time",
                                    tint = cardContentColor.copy(alpha = 0.7f),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                        if (showStartTime) {
                            TimePill(timeStr = prayer.startTimeStr)
                        }
                        if (showStartTime && showEndTime) {
                            Text(
                                text = " — ",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.ExtraBold,
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
        shape = RoundedCornerShape(13.dp),
        color = MaterialTheme.colorScheme.background,
    ) {
        Text(
            text = timeStr,
            style = MaterialTheme.typography.labelMedium.copy(
                fontSize = 14.sp,
                fontWeight = FontWeight.Black,
                fontFamily = RobotoMonoFontFamily
            ),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
