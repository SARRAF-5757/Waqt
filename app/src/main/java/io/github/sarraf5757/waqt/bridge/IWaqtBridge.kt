// Interface defining the bridge contract between Kotlin and the C++ Waqt engine

package io.github.sarraf5757.waqt.bridge

import android.content.Context
import kotlinx.coroutines.flow.SharedFlow

interface IWaqtBridge {
    val preferenceUpdates: SharedFlow<Unit>
    val historyUpdates: SharedFlow<Unit>

    fun initialize(context: Context): Boolean
    fun updateLocation(latitude: Double, longitude: Double)
    fun getHomeState(): NativeModels.HomeState?
    fun togglePrayer(dateKey: String, prayerId: String, completed: Boolean, isOnTime: Boolean): Boolean
    fun getPreferences(): NativeModels.PreferenceSettings?
    fun updatePreference(key: String, value: String)
    fun deleteAllHistory()
    fun getRangeGridData(startDate: String, endDate: String): NativeModels.StreakGridData?
    fun getRangeStats(startDate: String, endDate: String): NativeModels.HistoryStatsData?
    fun getNotificationSchedule(): List<NativeModels.NotificationIntent>
    fun getEndOptionPreviews(): NativeModels.EndOptionPreviews?
}
