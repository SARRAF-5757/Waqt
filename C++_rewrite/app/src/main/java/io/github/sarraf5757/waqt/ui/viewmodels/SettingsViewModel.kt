/**
 * ViewModel managing user settings and preferences
 */

package io.github.sarraf5757.waqt.ui.viewmodels

import android.app.Application

import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.notifications.NotificationScheduler

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
        val numericOnly = offsetStr.replace(Regex("[^0-9]"), "")
        val parsedInt = numericOnly.toIntOrNull()
        
        var finalOffset = 15
        if (parsedInt != null) {
            finalOffset = parsedInt
        }
        
        // Clamp between 0 and 120 minutes
        if (finalOffset < 0) finalOffset = 0
        if (finalOffset > 120) finalOffset = 120
        
        WaqtNativeBridge.updatePreference("endTimeOffset", finalOffset.toString())
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
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
        val valueString = if (show) {
            "true"
        } else {
            "false"
        }
        WaqtNativeBridge.updatePreference("showStartTime", valueString)
        loadPreferences()
    }

    /**
     * Persists preference setting
     */
    fun updateShowEndTime(show: Boolean) {
        val valueString = if (show) {
            "true"
        } else {
            "false"
        }
        WaqtNativeBridge.updatePreference("showEndTime", valueString)
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
