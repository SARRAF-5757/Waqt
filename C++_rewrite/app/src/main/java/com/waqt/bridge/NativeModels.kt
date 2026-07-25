/**
 * File Role: Data models mirroring C++ core structures passed over the JNI boundary.
 */
package com.waqt.bridge

class NativeModels {

    /**
     * Home screen state for today's prayers.
     */
    data class HomeState(
        val dateKey: String,
        val fajrCompleted: Boolean,
        val dhuhrCompleted: Boolean,
        val asrCompleted: Boolean,
        val maghribCompleted: Boolean,
        val ishaCompleted: Boolean,
        val fajrStartSec: Long,
        val fajrEndSec: Long,
        val dhuhrStartSec: Long,
        val dhuhrEndSec: Long,
        val asrStartSec: Long,
        val asrEndSec: Long,
        val maghribStartSec: Long,
        val maghribEndSec: Long,
        val ishaStartSec: Long,
        val ishaEndSec: Long,
        val showStartTime: Boolean,
        val showEndTime: Boolean
    )

    /**
     * User preference settings.
     */
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
     * Notification schedule intent returned by C++ core.
     */
    data class NotificationIntent(
        val id: String,
        val title: String,
        val body: String,
        val triggerTimestampSec: Long
    )

    /**
     * Completion grid for a single prayer over 105 days.
     */
    data class PrayerStreak(
        val prayerId: String,
        val completionGrid: BooleanArray
    )

    /**
     * Container for all 5 prayer streak grids.
     */
    data class StreakGridData(
        val totalDays: Int,
        val streaks: Array<PrayerStreak>
    )
}
