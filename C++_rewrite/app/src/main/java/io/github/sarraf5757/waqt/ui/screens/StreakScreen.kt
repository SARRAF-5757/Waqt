/**
 * Streak screen UI showing historical prayer contribution grids
 */

package io.github.sarraf5757.waqt.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.ui.viewmodels.StreakViewModel


/**
 * Renders History tab with centered "Streak" title and 5 contribution grid cards
 */
@Composable
fun StreakScreen(viewModel: StreakViewModel) {
    val streakData by viewModel.streakData.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    if (isLoading || streakData == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

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

        Spacer(modifier = Modifier.height(20.dp))

        // 5 Prayer Contribution Graphs
        streakData!!.streaks.forEach { prayerStreak ->
            PrayerContributionCard(
                prayerName = prayerStreak.prayerId,
                completionGrid = prayerStreak.completionGrid,
                onTimeGrid = prayerStreak.onTimeGrid,
                weekdayLetters = stringArrayResource(R.array.weekday_letters).toList()
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        Spacer(modifier = Modifier.height(100.dp))
    }
}

/**
 * Grid drawing to minimize UI nodes using a canvas
 */
@Composable
fun ContributionGrid(completionGrid: BooleanArray, onTimeGrid: BooleanArray, modifier: Modifier = Modifier) {
    val completedOnTimeColor = MaterialTheme.colorScheme.primary
    val completedLateColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
    val uncompletedColor = MaterialTheme.colorScheme.surface
    val cornerRadius = 4.dp
    val cellSize = 16.dp
    val spacing = 4.dp

    Canvas(
        modifier = modifier
            .width((15 * 16 + 14 * 4).dp)
            .height((7 * 16 + 6 * 4).dp)
    ) {
        val cellSizePx = cellSize.toPx()
        val spacingPx = spacing.toPx()
        val cornerRadiusPx = cornerRadius.toPx()

        for (weekIndex in 0 until 15) {
            for (dayOfWeek in 0 until 7) {
                val cellIndex = weekIndex * 7 + dayOfWeek
                val isCompleted = if (cellIndex < completionGrid.size) completionGrid[cellIndex] else false
                val isOnTime = if (cellIndex < onTimeGrid.size) onTimeGrid[cellIndex] else false
                val color = when {
                    isCompleted && isOnTime -> completedOnTimeColor
                    isCompleted && !isOnTime -> completedLateColor
                    else -> uncompletedColor
                }

                drawRoundRect(
                    color = color,
                    topLeft = Offset(
                        x = weekIndex * (cellSizePx + spacingPx),
                        y = dayOfWeek * (cellSizePx + spacingPx)
                    ),
                    size = Size(cellSizePx, cellSizePx),
                    cornerRadius = CornerRadius(cornerRadiusPx, cornerRadiusPx)
                )
            }
        }
    }
}

/**
 * Renders card container with weekday indicators and 7x15 grid of day cells
 */
@Composable
fun PrayerContributionCard(
    prayerName: String,
    completionGrid: BooleanArray,
    onTimeGrid: BooleanArray,
    weekdayLetters: List<String>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = prayerName,
                style = MaterialTheme.typography.titleMedium.copy(fontSize = 22.sp, fontWeight = FontWeight.Bold),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.Top
            ) {
                // Weekday indicator letters S M T W T F S
                Column(
                    modifier = Modifier.padding(end = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    weekdayLetters.forEach { letter ->
                        Box(
                            modifier = Modifier.size(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = letter,
                                style = MaterialTheme.typography.labelMedium.copy(fontSize = 11.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // Scrollable Grid
                Box(modifier = Modifier.horizontalScroll(rememberScrollState())) {
                    ContributionGrid(
                        completionGrid = completionGrid,
                        onTimeGrid = onTimeGrid
                    )
                }
            }
        }
    }
}
