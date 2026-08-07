/**
 * Advanced history visualization screen with multiple views and infinite navigation
 */

package io.github.sarraf5757.waqt.ui.screens

import java.time.LocalDate

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.ui.viewmodels.Granularity
import io.github.sarraf5757.waqt.ui.viewmodels.MajorView
import io.github.sarraf5757.waqt.ui.viewmodels.StreakViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StreakScreen(viewModel: StreakViewModel) {
    val majorView by viewModel.majorView.collectAsState()
    val granularity by viewModel.granularity.collectAsState()
    val dateLabel by viewModel.dateLabel.collectAsState()
    val streakData by viewModel.streakData.collectAsState()
    val statsData by viewModel.statsData.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val baseDate by viewModel.baseDate.collectAsState()
    val canNavigateNext by viewModel.canNavigateNext.collectAsState()

    var majorMenuExpanded by remember { mutableStateOf(false) }
    var granularityMenuExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(26.dp))

        // Screen title "Streak"
        Text(
            text = stringResource(R.string.streak_title),
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 30.sp, fontWeight = FontWeight.Bold),
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 18.dp)
        )

        // Dropdown Header Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Major View (Left)
            ExposedDropdownMenuBox(
                expanded = majorMenuExpanded,
                onExpandedChange = { expanded -> majorMenuExpanded = expanded },
                modifier = Modifier.weight(1f)
            ) {
                OutlinedTextField(
                    value = formatMajorView(majorView),
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = majorMenuExpanded) },
                    modifier = Modifier.menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable),
                    shape = RoundedCornerShape(12.dp),
                    textStyle = MaterialTheme.typography.bodyMedium
                )
                ExposedDropdownMenu(
                    expanded = majorMenuExpanded,
                    onDismissRequest = { majorMenuExpanded = false }
                ) {
                    val views = MajorView.entries
                    for (mv in views) {
                        DropdownMenuItem(
                            text = { Text(formatMajorView(mv)) },
                            onClick = {
                                viewModel.setMajorView(mv)
                                majorMenuExpanded = false
                            }
                        )
                    }
                }
            }

            // Granularity (Right)
            val options = when (majorView) {
                MajorView.MATRIX -> listOf(Granularity.MAX_DAYS, Granularity.MONTHLY)
                MajorView.STATS, MajorView.BAR_CHART -> listOf(Granularity.WEEKLY, Granularity.MONTHLY, Granularity.YEARLY)
            }

            ExposedDropdownMenuBox(
                expanded = granularityMenuExpanded,
                onExpandedChange = { expanded -> granularityMenuExpanded = expanded },
                modifier = Modifier.weight(1f)
            ) {
                OutlinedTextField(
                    value = formatGranularity(granularity),
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = granularityMenuExpanded) },
                    modifier = Modifier.menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable),
                    shape = RoundedCornerShape(12.dp),
                    textStyle = MaterialTheme.typography.bodyMedium
                )
                ExposedDropdownMenu(
                    expanded = granularityMenuExpanded,
                    onDismissRequest = { granularityMenuExpanded = false }
                ) {
                    for (gr in options) {
                        DropdownMenuItem(
                            text = { Text(formatGranularity(gr)) },
                            onClick = {
                                viewModel.setGranularity(gr)
                                granularityMenuExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Navigation Arrows and Date Label
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(onClick = { viewModel.previous() }) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Previous")
            }

            Text(
                text = dateLabel,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )

            IconButton(
                onClick = { viewModel.next() },
                enabled = canNavigateNext
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Next")
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        if (isLoading) {
            Box(modifier = Modifier.padding(top = 40.dp)) {
                CircularProgressIndicator()
            }
        } else {
            if (majorView == MajorView.MATRIX) {
                val data = streakData
                if (data != null) {
                    val weekdayStrings = stringArrayResource(R.array.weekday_letters)
                    val weekdayLetters = weekdayStrings.toList()
                    for (prayerStreak in data.streaks) {
                        PrayerContributionCard(
                            prayerName = prayerStreak.prayerId,
                            completionGrid = prayerStreak.completionGrid,
                            onTimeGrid = prayerStreak.onTimeGrid,
                            granularity = granularity,
                            baseDate = baseDate,
                            weekdayLetters = weekdayLetters
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                    }
                }
            } else if (majorView == MajorView.STATS) {
                val data = statsData
                if (data != null) {
                    for (stats in data.stats) {
                        PrayerChartCard(
                            prayerName = stats.prayerId,
                            onTimeCount = stats.onTimeCount,
                            lateCount = stats.lateCount,
                            missedCount = stats.missedCount
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                    }
                }
            } else if (majorView == MajorView.BAR_CHART) {
                val data = statsData
                if (data != null) {
                    BarChartView(statsData = data)
                }
            }
        }

        Spacer(modifier = Modifier.height(120.dp))
    }
}

@Composable
fun formatMajorView(mv: MajorView): String {
    return when (mv) {
        MajorView.MATRIX -> "Matrix"
        MajorView.STATS -> "Stats"
        MajorView.BAR_CHART -> "Bar Chart"
    }
}

@Composable
fun formatGranularity(gr: Granularity): String {
    return when (gr) {
        Granularity.MAX_DAYS -> "Max Days"
        Granularity.MONTHLY -> "Monthly"
        Granularity.WEEKLY -> "Weekly"
        Granularity.YEARLY -> "Yearly"
    }
}

/**
 * High-performance canvas-based grid drawing for GitHub-style matrix
 */
@Composable
fun MatrixGrid(completionGrid: BooleanArray, onTimeGrid: BooleanArray, numWeeks: Int) {
    val onTimeColor = MaterialTheme.colorScheme.primary
    val lateColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
    val uncompletedColor = MaterialTheme.colorScheme.surface
    val cellSize = 16.dp
    val spacing = 4.dp

    Canvas(
        modifier = Modifier
            .width((numWeeks * 16 + (numWeeks - 1) * 4).dp)
            .height((7 * 16 + 6 * 4).dp)
    ) {
        val cellSizePx = cellSize.toPx()
        val spacingPx = spacing.toPx()

        for (weekIndex in 0 until numWeeks) {
            for (dayOfWeek in 0 until 7) {
                val cellIndex = weekIndex * 7 + dayOfWeek
                if (cellIndex >= completionGrid.size) continue

                val isCompleted = completionGrid[cellIndex]
                val isOnTime = onTimeGrid[cellIndex]
                val color = when {
                    isCompleted && isOnTime -> onTimeColor
                    isCompleted && !isOnTime -> lateColor
                    else -> uncompletedColor
                }

                drawRoundRect(
                    color = color,
                    topLeft = Offset(
                        x = weekIndex * (cellSizePx + spacingPx),
                        y = dayOfWeek * (cellSizePx + spacingPx)
                    ),
                    size = Size(cellSizePx, cellSizePx),
                    cornerRadius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
                )
            }
        }
    }
}

/**
 * Standard calendar-style grid for monthly matrix view
 */
@Composable
fun CalendarGrid(completionGrid: BooleanArray, onTimeGrid: BooleanArray, date: LocalDate) {
    val firstDay = date.withDayOfMonth(1)
    val offset = firstDay.dayOfWeek.value % 7 // Sun=0, Mon=1...
    val daysInMonth = date.lengthOfMonth()
    
    val onTimeColor = MaterialTheme.colorScheme.primary
    val lateColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
    val uncompletedColor = MaterialTheme.colorScheme.surface
    val cellSize = 24.dp
    val spacing = 6.dp

    Column(verticalArrangement = Arrangement.spacedBy(spacing)) {
        val rows = (daysInMonth + offset + 6) / 7
        for (r in 0 until rows) {
            Row(horizontalArrangement = Arrangement.spacedBy(spacing)) {
                for (c in 0 until 7) {
                    val pos = r * 7 + c
                    val dayIdx = pos - offset
                    if (dayIdx in 0 until daysInMonth) {
                        val isCompleted = completionGrid[dayIdx]
                        val isOnTime = onTimeGrid[dayIdx]
                        val color = when {
                            isCompleted && isOnTime -> onTimeColor
                            isCompleted && !isOnTime -> lateColor
                            else -> uncompletedColor
                        }
                        Box(
                            modifier = Modifier
                                .size(cellSize)
                                .clip(RoundedCornerShape(4.dp))
                                .background(color)
                        )
                    } else {
                        Spacer(modifier = Modifier.size(cellSize))
                    }
                }
            }
        }
    }
}

@Composable
fun PrayerContributionCard(
    prayerName: String,
    completionGrid: BooleanArray,
    onTimeGrid: BooleanArray,
    granularity: Granularity,
    baseDate: LocalDate,
    weekdayLetters: List<String>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = prayerName,
                style = MaterialTheme.typography.titleMedium.copy(fontSize = 22.sp, fontWeight = FontWeight.Bold),
                modifier = Modifier.padding(bottom = 16.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                // Weekday labels
                Column(
                    modifier = Modifier.padding(end = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(if (granularity == Granularity.MAX_DAYS) 4.dp else 11.dp)
                ) {
                    weekdayLetters.forEach { letter ->
                        Text(
                            text = letter,
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(if (granularity == Granularity.MAX_DAYS) 16.dp else 24.dp),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                // Grid content
                if (granularity == Granularity.MAX_DAYS) {
                    Box(modifier = Modifier.horizontalScroll(rememberScrollState())) {
                        MatrixGrid(completionGrid, onTimeGrid, numWeeks = 15)
                    }
                } else {
                    CalendarGrid(completionGrid, onTimeGrid, baseDate)
                }
            }
        }
    }
}

@Composable
fun PrayerChartCard(prayerName: String, onTimeCount: Int, lateCount: Int, missedCount: Int) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = prayerName,
                style = MaterialTheme.typography.titleMedium.copy(fontSize = 20.sp, fontWeight = FontWeight.Bold),
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // Stacked Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(32.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                val weightOnTime = onTimeCount.toFloat().coerceAtLeast(0.01f)
                val weightLate = lateCount.toFloat().coerceAtLeast(0.01f)
                val weightMissed = missedCount.toFloat().coerceAtLeast(0.01f)

                if (onTimeCount > 0) {
                    Box(modifier = Modifier.weight(weightOnTime).fillMaxHeight().background(MaterialTheme.colorScheme.primary))
                }
                if (lateCount > 0) {
                    Box(modifier = Modifier.weight(weightLate).fillMaxHeight().background(MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)))
                }
                if (missedCount > 0) {
                    Box(modifier = Modifier.weight(weightMissed).fillMaxHeight().background(Color.Transparent)) // Transparent shows surface
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Stats Legend
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatItem("$onTimeCount On Time", MaterialTheme.colorScheme.primary)
                StatItem("$lateCount Late", MaterialTheme.colorScheme.primary.copy(alpha = 0.4f))
                StatItem("$missedCount Missed", MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f))
            }
        }
    }
}

@Composable
fun StatItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(color))
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

/**
 * Bar Chart view that aggregates all 5 prayers into one vertical stacked chart
 */
@Composable
fun BarChartView(statsData: NativeModels.HistoryStatsData) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Stats Legend
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatItem("On Time", MaterialTheme.colorScheme.primary)
                StatItem("Late", MaterialTheme.colorScheme.primary.copy(alpha = 0.4f))
                StatItem("Missed", MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f))
            }

            // Chart
            Box(modifier = Modifier.fillMaxWidth().height(300.dp)) {
                BarChartCanvas(statsData)
            }
        }
    }
}

@Composable
fun BarChartCanvas(statsData: NativeModels.HistoryStatsData) {
    val onTimeColor = MaterialTheme.colorScheme.primary
    val lateColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
    val uncompletedColor = MaterialTheme.colorScheme.surface
    val labelColor = MaterialTheme.colorScheme.onSurfaceVariant
    
    val labels = listOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")

    Column(modifier = Modifier.fillMaxSize()) {
        Canvas(modifier = Modifier.weight(1f).fillMaxWidth()) {
            val width = size.width
            val height = size.height
            val barSpacing = 24.dp.toPx()
            
            val numBars = statsData.stats.size
            val barWidth = (width - (numBars - 1) * barSpacing) / numBars

            for (i in 0 until numBars) {
                val stats = statsData.stats[i]
                val x = i * (barWidth + barSpacing)
                
                val total = statsData.totalDays.toFloat().coerceAtLeast(1f)
                val hOnTime = (stats.onTimeCount / total) * height
                val hLate = (stats.lateCount / total) * height
                val hMissed = (stats.missedCount / total) * height

                // Draw Missed (Top)
                drawRoundRect(
                    color = uncompletedColor,
                    topLeft = Offset(x, 0f),
                    size = Size(barWidth, hMissed),
                    cornerRadius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
                )

                // Draw Late (Middle)
                drawRect(
                    color = lateColor,
                    topLeft = Offset(x, hMissed),
                    size = Size(barWidth, hLate)
                )

                // Draw On Time (Bottom)
                drawRoundRect(
                    color = onTimeColor,
                    topLeft = Offset(x, hMissed + hLate),
                    size = Size(barWidth, hOnTime),
                    cornerRadius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Labels row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            labels.forEach { label ->
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = labelColor,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
