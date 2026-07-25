/**
 * File Role: ViewModel managing today's prayer state and handling user toggle interactions.
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

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val _homeState = MutableStateFlow<NativeModels.HomeState?>(null)
    val homeState: StateFlow<NativeModels.HomeState?> = _homeState.asStateFlow()

    init {
        loadHomeState()
    }

    /**
     * RME:
     * Reads: System current timestamp in seconds via JNI bridge.
     * Modifies: `_homeState` StateFlow value.
     * Effects: Fetches today's updated prayer times and completion statuses from C++ core.
     */
    fun loadHomeState() {
        viewModelScope.launch {
            val state = WaqtNativeBridge.getHomeState()
            _homeState.value = state
        }
    }

    /**
     * RME:
     * Reads: Prayer ID (e.g., "fajr") and current completion status.
     * Modifies: SQLite history status in C++ engine and `_homeState` StateFlow.
     * Effects: Toggles completion state in database and triggers notification reschedule.
     */
    fun togglePrayer(prayerId: String) {
        val currentState = _homeState.value ?: return
        val dateKey = currentState.dateKey

        val currentCompleted = when (prayerId) {
            "fajr" -> currentState.fajrCompleted
            "dhuhr" -> currentState.dhuhrCompleted
            "asr" -> currentState.asrCompleted
            "maghrib" -> currentState.maghribCompleted
            "isha" -> currentState.ishaCompleted
            else -> false
        }

        viewModelScope.launch {
            WaqtNativeBridge.togglePrayer(dateKey, prayerId, !currentCompleted)
            loadHomeState()
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }
}
