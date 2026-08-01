// ViewModel managing user settings and preferences

package io.github.sarraf5757.waqt.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.notifications.NotificationScheduler
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
     * Reads latest preference settings from storage
     */
    fun loadPreferences() {
        viewModelScope.launch {
            val settings = WaqtNativeBridge.getPreferences()
            _prefs.value = settings
        }
    }

    /**
     * Updates preference and reschedules notification queue
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
     * Updates preference, recalculates prayer times, and reschedules notifications
     */
    fun updateCalculationMethod(method: String) {
        WaqtNativeBridge.updatePreference("calculationMethod", method)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Updates Asr calculation preference and reschedules notifications
     */
    fun updateMadhab(madhab: String) {
        WaqtNativeBridge.updatePreference("madhab", madhab)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Persists preference setting
     */
    fun updateShowStartTime(show: Boolean) {
        WaqtNativeBridge.updatePreference("showStartTime", if (show) "true" else "false")
        loadPreferences()
    }

    /**
     * Persists preference setting
     */
    fun updateShowEndTime(show: Boolean) {
        WaqtNativeBridge.updatePreference("showEndTime", if (show) "true" else "false")
        loadPreferences()
    }

    /**
     * Persists dynamic theme or custom accent color choice
     */
    fun updateThemeColor(color: String) {
        WaqtNativeBridge.updatePreference("themeColor", color)
        loadPreferences()
    }

    /**
     * Wipes all prayer completion history records. Preserves settings
     */
    fun deleteAllHistory() {
        viewModelScope.launch {
            WaqtNativeBridge.deleteAllHistory()
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }
}
