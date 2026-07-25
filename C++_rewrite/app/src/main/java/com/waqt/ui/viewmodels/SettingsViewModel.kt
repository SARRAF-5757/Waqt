/**
 * File Role: ViewModel managing user settings, calculation preferences, themes, and history deletion.
 */
package com.waqt.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.waqt.bridge.NativeModels
import com.waqt.bridge.WaqtNativeBridge
import com.waqt.notifications.NotificationScheduler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val _prefs = MutableStateFlow<NativeModels.PreferenceSettings?>(null)
    val prefs: StateFlow<NativeModels.PreferenceSettings?> = _prefs.asStateFlow()

    init {
        loadPreferences()
    }

    /**
     * RME:
     * Reads: C++ database preference table via JNI bridge.
     * Modifies: `_prefs` StateFlow value.
     * Effects: Reads latest preference settings from storage.
     */
    fun loadPreferences() {
        viewModelScope.launch {
            val settings = WaqtNativeBridge.getPreferences()
            _prefs.value = settings
        }
    }

    /**
     * RME:
     * Reads: End time warning offset string input.
     * Modifies: `endTimeOffset` setting in C++ database.
     * Effects: Updates preference and reschedules notification queue.
     */
    fun updateEndTimeOffset(offsetStr: String) {
        val numeric = offsetStr.replace(Regex("[^0-9]"), "")
        if (numeric.isNotEmpty()) {
            WaqtNativeBridge.updatePreference("endTimeOffset", numeric)
            loadPreferences()
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }

    /**
     * RME:
     * Reads: Calculation method identifier string.
     * Modifies: `calculationMethod` setting in C++ database.
     * Effects: Updates preference, recalculates prayer times, and reschedules notifications.
     */
    fun updateCalculationMethod(method: String) {
        WaqtNativeBridge.updatePreference("calculationMethod", method)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * RME:
     * Reads: Madhab identifier string ("shafi" or "hanafi").
     * Modifies: `madhab` setting in C++ database.
     * Effects: Updates Asr calculation preference and reschedules notifications.
     */
    fun updateMadhab(madhab: String) {
        WaqtNativeBridge.updatePreference("madhab", madhab)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * RME:
     * Reads: Boolean flag for showing start times on Home screen.
     * Modifies: `showStartTime` setting in C++ database.
     * Effects: Persists preference setting.
     */
    fun updateShowStartTime(show: Boolean) {
        WaqtNativeBridge.updatePreference("showStartTime", if (show) "true" else "false")
        loadPreferences()
    }

    /**
     * RME:
     * Reads: Boolean flag for showing end times on Home screen.
     * Modifies: `showEndTime` setting in C++ database.
     * Effects: Persists preference setting.
     */
    fun updateShowEndTime(show: Boolean) {
        WaqtNativeBridge.updatePreference("showEndTime", if (show) "true" else "false")
        loadPreferences()
    }

    /**
     * RME:
     * Reads: Theme color hex string or "Material You".
     * Modifies: `themeColor` setting in C++ database.
     * Effects: Persists dynamic theme or custom accent color choice.
     */
    fun updateThemeColor(color: String) {
        WaqtNativeBridge.updatePreference("themeColor", color)
        loadPreferences()
    }

    /**
     * RME:
     * Reads: None.
     * Modifies: SQLite `history` table in C++ core.
     * Effects: Wipes all prayer completion history records. Preserves settings.
     */
    fun deleteAllHistory() {
        viewModelScope.launch {
            WaqtNativeBridge.deleteAllHistory()
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }
}
