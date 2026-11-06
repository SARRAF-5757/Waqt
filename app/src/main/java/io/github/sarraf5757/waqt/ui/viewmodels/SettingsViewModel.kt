/**
 * ViewModel managing user settings and preferences
 */

package io.github.sarraf5757.waqt.ui.viewmodels

import android.app.Application
import android.net.Uri

import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.notifications.NotificationScheduler

class SettingsViewModel(application: Application, private val waqtBridge: io.github.sarraf5757.waqt.bridge.IWaqtBridge) : AndroidViewModel(application) {

    private val _prefs = MutableStateFlow<NativeModels.PreferenceSettings?>(null)
    val prefs: StateFlow<NativeModels.PreferenceSettings?> = _prefs.asStateFlow()

    private val _endOptionPreviews = MutableStateFlow<NativeModels.EndOptionPreviews?>(null)
    val endOptionPreviews: StateFlow<NativeModels.EndOptionPreviews?> = _endOptionPreviews.asStateFlow()

    private val _pendingRestorePayload = MutableStateFlow<NativeModels.HistoryBackupPayload?>(null)
    val pendingRestorePayload: StateFlow<NativeModels.HistoryBackupPayload?> = _pendingRestorePayload.asStateFlow()

    private val _userMessage = MutableStateFlow<String?>(null)
    val userMessage: StateFlow<String?> = _userMessage.asStateFlow()

    init {
        loadPreferences()
    }

    /**
     * Reads latest preference settings from storage
     */
    fun loadPreferences() {
        viewModelScope.launch {
            val settings = waqtBridge.getPreferences()
            _prefs.value = settings
            
            val previews = waqtBridge.getEndOptionPreviews()
            _endOptionPreviews.value = previews
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
        
        waqtBridge.updatePreference("endTimeOffset", finalOffset.toString())
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Updates Maghrib end calculation mode and reschedules notifications
     */
    fun updateMaghribEndMode(mode: String) {
        waqtBridge.updatePreference("maghribEndMode", mode)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Updates custom minute duration for fixed Maghrib end and reschedules notifications
     */
    fun updateMaghribEndCustomMinutes(minutesStr: String) {
        val numericOnly = minutesStr.replace(Regex("[^0-9]"), "")
        val parsedInt = numericOnly.toIntOrNull() ?: 90
        waqtBridge.updatePreference("maghribEndCustomMinutes", parsedInt.toString())
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Updates Isha end calculation mode and reschedules notifications
     */
    fun updateIshaEndMode(mode: String) {
        waqtBridge.updatePreference("ishaEndMode", mode)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Updates preference, recalculates prayer times, and reschedules notifications
     */
    fun updateCalculationMethod(method: String) {
        waqtBridge.updatePreference("calculationMethod", method)
        loadPreferences()
        NotificationScheduler.scheduleNotifications(getApplication())
    }

    /**
     * Updates Asr calculation preference and reschedules notifications
     */
    fun updateMadhab(madhab: String) {
        waqtBridge.updatePreference("madhab", madhab)
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
        waqtBridge.updatePreference("showStartTime", valueString)
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
        waqtBridge.updatePreference("showEndTime", valueString)
        loadPreferences()
    }

    /**
     * Persists dynamic theme or custom accent color choice
     */
    fun updateThemeColor(color: String) {
        waqtBridge.updatePreference("themeColor", color)
        loadPreferences()
    }

    /**
     * Wipes all prayer completion history records. Preserves settings
     */
    fun deleteAllHistory() {
        viewModelScope.launch {
            waqtBridge.deleteAllHistory()
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }

    /**
     * Exports prayer history records to the specified destination URI as JSON
     */
    fun exportBackup(uri: Uri) {
        viewModelScope.launch {
            try {
                val records = withContext(Dispatchers.IO) {
                    waqtBridge.getAllHistory()
                }

                if (records.isEmpty()) {
                    _userMessage.value = getApplication<Application>().getString(R.string.export_empty)
                    return@launch
                }

                val payload = NativeModels.HistoryBackupPayload(
                    history = records,
                    totalRecords = records.size
                )

                val json = Json { prettyPrint = true }
                val jsonString = json.encodeToString(payload)

                withContext(Dispatchers.IO) {
                    val outputStream = getApplication<Application>().contentResolver.openOutputStream(uri)
                        ?: throw IllegalArgumentException("Cannot open output stream")
                    outputStream.bufferedWriter().use { it.write(jsonString) }
                }

                _userMessage.value = getApplication<Application>().getString(R.string.export_success, records.size)
            } catch (e: Exception) {
                _userMessage.value = getApplication<Application>().getString(R.string.export_failed)
            }
        }
    }

    /**
     * Reads and parses a backup file, showing confirmation dialog if valid
     */
    fun prepareRestore(uri: Uri) {
        viewModelScope.launch {
            try {
                val jsonString = withContext(Dispatchers.IO) {
                    val inputStream = getApplication<Application>().contentResolver.openInputStream(uri)
                        ?: throw IllegalArgumentException("Cannot open input stream")
                    inputStream.bufferedReader().use { it.readText() }
                }

                val json = Json { ignoreUnknownKeys = true }
                val payload = json.decodeFromString<NativeModels.HistoryBackupPayload>(jsonString)

                val validPrayers = setOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")
                val validRecords = payload.history.filter { record ->
                    val isValidDate = try {
                        java.time.LocalDate.parse(record.dateKey)
                        true
                    } catch (_: Exception) {
                        false
                    }
                    isValidDate && validPrayers.contains(record.prayerId)
                }

                if (validRecords.isEmpty() && payload.history.isNotEmpty()) {
                    _userMessage.value = getApplication<Application>().getString(R.string.restore_failed_invalid)
                    return@launch
                }

                val validatedPayload = payload.copy(history = validRecords, totalRecords = validRecords.size)
                _pendingRestorePayload.value = validatedPayload
            } catch (e: Exception) {
                _userMessage.value = getApplication<Application>().getString(R.string.restore_failed_invalid)
            }
        }
    }

    /**
     * Confirms destructive restore of prayer history records from the parsed payload
     */
    fun confirmRestore(payload: NativeModels.HistoryBackupPayload) {
        viewModelScope.launch {
            val success = withContext(Dispatchers.IO) {
                waqtBridge.replaceAllHistory(payload.history)
            }
            _pendingRestorePayload.value = null
            if (success) {
                NotificationScheduler.scheduleNotifications(getApplication())
                _userMessage.value = getApplication<Application>().getString(R.string.restore_success, payload.history.size)
            } else {
                _userMessage.value = getApplication<Application>().getString(R.string.restore_failed_invalid)
            }
        }
    }

    /**
     * Dismisses the restore confirmation dialog
     */
    fun dismissRestoreDialog() {
        _pendingRestorePayload.value = null
    }

    /**
     * Clears user feedback message after display
     */
    fun clearUserMessage() {
        _userMessage.value = null
    }
}
