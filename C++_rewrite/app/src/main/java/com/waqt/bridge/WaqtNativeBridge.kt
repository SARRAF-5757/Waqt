/**
 * File Role: JNI Bridge singleton providing native C++ calls to Kotlin code.
 */
package com.waqt.bridge

import android.content.Context
import java.io.File

object WaqtNativeBridge {

    init {
        System.loadLibrary("waqt_core")
    }

    /**
     * RME:
     * Reads: Context files directory path.
     * Modifies: SQLite database file `waqt_native.db` initialization in C++.
     * Effects: Opens or creates SQLite database on internal device storage.
     */
    fun initialize(context: Context): Boolean {
        val dbFile = File(context.filesDir, "waqt_native.db")
        return nativeInitialize(dbFile.absolutePath)
    }

    /**
     * RME:
     * Reads: Latitude and longitude coordinates.
     * Modifies: C++ engine location state and database preferences.
     * Effects: Recalculates Fajr cutoff and prayer times.
     */
    fun updateLocation(latitude: Double, longitude: Double) {
        nativeUpdateLocation(latitude, longitude)
    }

    /**
     * RME:
     * Reads: Current system UNIX timestamp in seconds.
     * Modifies: None.
     * Effects: Queries C++ core for today's prayer times and completion statuses.
     */
    fun getHomeState(nowSec: Long = System.currentTimeMillis() / 1000): NativeModels.HomeState? {
        return nativeGetHomeState(nowSec)
    }

    /**
     * RME:
     * Reads: Target dateKey (YYYY-MM-DD), prayer ID, and target completion status.
     * Modifies: SQLite history table entry in C++.
     * Effects: Persists prayer completion state to disk.
     */
    fun togglePrayer(dateKey: String, prayerId: String, completed: Boolean): Boolean {
        return nativeTogglePrayer(dateKey, prayerId, completed)
    }

    /**
     * RME:
     * Reads: C++ database preference table.
     * Modifies: None.
     * Effects: Returns current user preference settings.
     */
    fun getPreferences(): NativeModels.PreferenceSettings? {
        return nativeGetPreferences()
    }

    /**
     * RME:
     * Reads: Preference key and value.
     * Modifies: SQLite preference table in C++.
     * Effects: Updates preference value on disk.
     */
    fun updatePreference(key: String, value: String) {
        nativeUpdatePreference(key, value)
    }

    /**
     * RME:
     * Reads: SQLite database.
     * Modifies: Deletes all rows from `history` table.
     * Effects: Clears prayer history from disk. Does not touch preferences.
     */
    fun deleteAllHistory() {
        nativeDeleteAllHistory()
    }

    /**
     * RME:
     * Reads: Current system UNIX timestamp in seconds.
     * Modifies: None.
     * Effects: Queries SQLite history for 105-day streak grid data per prayer.
     */
    fun getStreakData(nowSec: Long = System.currentTimeMillis() / 1000): NativeModels.StreakGridData? {
        return nativeGetStreakData(nowSec)
    }

    /**
     * RME:
     * Reads: Current timestamp, location, preferences, and completion history.
     * Modifies: None.
     * Effects: Returns ordered list of future notification intents computed by C++ core.
     */
    fun getNotificationSchedule(nowSec: Long = System.currentTimeMillis() / 1000): Array<NativeModels.NotificationIntent> {
        return nativeGetNotificationSchedule(nowSec) ?: emptyArray()
    }

    // Native JNI external method declarations
    private external fun nativeInitialize(dbPath: String): Boolean
    private external fun nativeUpdateLocation(latitude: Double, longitude: Double)
    private external fun nativeGetHomeState(nowSec: Long): NativeModels.HomeState?
    private external fun nativeTogglePrayer(dateKey: String, prayerId: String, completed: Boolean): Boolean
    private external fun nativeGetPreferences(): NativeModels.PreferenceSettings?
    private external fun nativeUpdatePreference(key: String, value: String)
    private external fun nativeDeleteAllHistory()
    private external fun nativeGetStreakData(nowSec: Long): NativeModels.StreakGridData?
    private external fun nativeGetNotificationSchedule(nowSec: Long): Array<NativeModels.NotificationIntent>?
}
