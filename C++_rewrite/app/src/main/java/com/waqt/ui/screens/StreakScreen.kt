/**
 * File Role: Streak/History screen UI rendering 5 GitHub-style 105-day contribution grids for each prayer.
 */
package com.waqt.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.bridge.NativeModels
import com.waqt.ui.viewmodels.StreakViewModel

private val WEEKDAY_LETTERS = listOf("S", "M", "T", "W", "T", "F", "S")
private val PRAYER_NAMES = mapOf(
    "fajr" to "Fajr",
    "dhuhr" to "Dhuhr",
    "asr" to "Asr",
    "maghrib" to "Maghrib",
    "isha" to "Isha"
)

/**
 * RME:
 * Reads: `StreakViewModel` state (`streakData`, `isLoading`).
 * Modifies: None.
 * Effects: Renders History tab with centered "Streak" title and 5 contribution grid cards.
 */
@Composable
fun StreakScreen(viewModel: StreakViewModel) {
    val streakData by viewModel.streakData.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadStreakData()
    }

    if (isLoading || streakData == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

    val data = streakData!!

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(bottom = 120.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(20.dp))

        // Screen title "Streak"
        Text(
            text = "Streak",
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 30.sp, fontWeight = FontWeight.Bold),
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 18.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // 5 Prayer Contribution Graphs
        data.streaks.forEach { prayerStreak ->
            val pName = PRAYER_NAMES[prayerStreak.prayerId] ?: prayerStreak.prayerId
            PrayerContributionCard(prayerName = pName, gridData = prayerStreak.completionGrid)
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

/**
 * RME:
 * Reads: Prayer name and 105-element boolean completion array.
 * Modifies: None.
 * Effects: Renders card container with weekday indicators and 7x15 grid of day cells.
 */
@Composable
fun PrayerContributionCard(prayerName: String, gridData: BooleanArray) {
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
                    WEEKDAY_LETTERS.forEach { letter ->
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

                // Grid of 15 week columns (105 days / 7 = 15 weeks)
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    val numWeeks = gridData.size / 7
                    for (weekIndex in 0 until numWeeks) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            for (dayOfWeek in 0 until 7) {
                                val cellIndex = weekIndex * 7 + dayOfWeek
                                val isCompleted = if (cellIndex < gridData.size) gridData[cellIndex] else false
                                val cellColor = if (isCompleted) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface

                                Box(
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(cellColor)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
