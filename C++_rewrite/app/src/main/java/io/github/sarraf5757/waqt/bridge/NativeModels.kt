// Kotlin data classes mirroring the C++ structures

package io.github.sarraf5757.waqt.bridge

import androidx.compose.runtime.Immutable

class NativeModels {

    /**
     * UI representation of a single prayer task card
     */
    @Immutable
    data class UIPrayerItem(
        val id: String,
        val name: String,
        val startTimeStr: String,
        val endTimeStr: String,
        val isCompleted: Boolean
    )

    /**
     * Home screen state for today's prayers
     */
    @Immutable
    data class HomeState(
        val dateKey: String,
        val prayers: Array<UIPrayerItem>,
        val showStartTime: Boolean,
        val showEndTime: Boolean
    )

    /**
     * User preference settings
     */
    @Immutable
    data class PreferenceSettings(
        val showStartTime: Boolean,
        val showEndTime: Boolean,
        val calculationMethod: String,
        val madhab: String,
        val themeColor: String,
        val endTimeOffset: Int,
        val latitude: Double,
        val longitude: Double,
        val hasLocation: Boolean
    )

    /**
     * Notification schedule intent returned by C++ core
     */
    @Immutable
    data class NotificationIntent(
        val id: String,
        val title: String,
        val body: String,
        val triggerTimestampSec: Long
    )

    /**
     * Completion grid for a single prayer over 105 days
     */
    @Immutable
    data class PrayerStreak(
        val prayerId: String,
        val completionGrid: BooleanArray
    )

    /**
     * Container for all 5 prayer streak grids
     */
    @Immutable
    data class StreakGridData(
        val totalDays: Int,
        val streaks: Array<PrayerStreak>
    )
}
