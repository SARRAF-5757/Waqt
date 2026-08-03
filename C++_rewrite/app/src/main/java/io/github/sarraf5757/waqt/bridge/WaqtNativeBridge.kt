// Kotlin interface for communicating with the C++ Waqt engine

package io.github.sarraf5757.waqt.bridge

import android.content.Context
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import java.io.File

object WaqtNativeBridge {

    /**
     * Observable flow for preference changes
     */
    val preferenceUpdates = MutableSharedFlow<Unit>(
        extraBufferCapacity = 1,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )

    /**
     * Observable flow for history (prayer toggle, delete all) changes
     */
    val historyUpdates = MutableSharedFlow<Unit>(
        extraBufferCapacity = 1,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )

    init {
        // Loads the shared library built by CMake (libwaqt_core.so)
        System.loadLibrary("waqt_core")
    }

    /**
     * Passes the device's internal application path to C++ (so SQLite knows where to save files)
     */
    fun initialize(context: Context): Boolean {
        val dbFile = File(context.filesDir, "waqt_native.db")
        return nativeInitialize(dbFile.absolutePath)
    }

    /**
     * Forwards GPS coordinates to the C++ core
     */
    fun updateLocation(latitude: Double, longitude: Double) {
        nativeUpdateLocation(latitude, longitude)
    }

    /**
     * Calls C++, which formats all the time and prayer strings into a ready-to-display object
     */
    fun getHomeState(nowSec: Long = System.currentTimeMillis() / 1000): NativeModels.HomeState? {
        return nativeGetHomeState(nowSec)
    }

    /**
     * Persists a checkbox change to the SQLite database
     */
    fun togglePrayer(dateKey: String, prayerId: String, completed: Boolean, isOnTime: Boolean): Boolean {
        val result = nativeTogglePrayer(dateKey, prayerId, completed, isOnTime)
        // Emit update regardless of whether prayer is now checked or unchecked
        historyUpdates.tryEmit(Unit)
        return result
    }

    fun getPreferences(): NativeModels.PreferenceSettings? {
        return nativeGetPreferences()
    }

    fun updatePreference(key: String, value: String) {
        nativeUpdatePreference(key, value)
        preferenceUpdates.tryEmit(Unit)
    }

    fun deleteAllHistory() {
        nativeDeleteAllHistory()
        historyUpdates.tryEmit(Unit)
    }

    fun getStreakData(nowSec: Long = System.currentTimeMillis() / 1000): NativeModels.StreakGridData? {
        return nativeGetStreakData(nowSec)
    }

    fun getNotificationSchedule(nowSec: Long = System.currentTimeMillis() / 1000): Array<NativeModels.NotificationIntent> {
        return nativeGetNotificationSchedule(nowSec) ?: emptyArray()
    }

    /**
     * NATIVE EXTERNAL DECLARATIONS - in bridge/jni_bindings.cpp
     * [The 'external' keyword tells the Kotlin compiler that the implementation is in the shared library]
     */
    private external fun nativeInitialize(dbPath: String): Boolean
    private external fun nativeUpdateLocation(latitude: Double, longitude: Double)
    private external fun nativeGetHomeState(nowSec: Long): NativeModels.HomeState?
    private external fun nativeTogglePrayer(dateKey: String, prayerId: String, completed: Boolean, isOnTime: Boolean): Boolean
    private external fun nativeGetPreferences(): NativeModels.PreferenceSettings?
    private external fun nativeUpdatePreference(key: String, value: String)
    private external fun nativeDeleteAllHistory()
    private external fun nativeGetStreakData(nowSec: Long): NativeModels.StreakGridData?
    private external fun nativeGetNotificationSchedule(nowSec: Long): Array<NativeModels.NotificationIntent>?
}
