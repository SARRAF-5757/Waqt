// ViewModel managing state and logic for the home screen

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

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    /**
     * When the value of `_homeState` changes, the UI automatically redraws
     */
    private val _homeState = MutableStateFlow<NativeModels.HomeState?>(null)
    val homeState: StateFlow<NativeModels.HomeState?> = _homeState.asStateFlow()

    init {
        loadHomeState()
        // Sync with preference changes from Settings screen
        viewModelScope.launch {
            WaqtNativeBridge.preferenceUpdates.collect {
                loadHomeState()
            }
        }
    }

    /**
     * Triggers a JNI call to the C++ core to fetch the latest display data
     */
    fun loadHomeState() {
        // viewModelScope - ensures this runs on a background thread if needed and
        // is canceled if the user leaves the screen
        viewModelScope.launch {
            val state = WaqtNativeBridge.getHomeState()
            _homeState.value = state
        }
    }

    /**
     * Sends a UI event (checking a box) down to the C++ database
     */
    fun togglePrayer(prayerId: String) {
        val currentState = _homeState.value ?: return
        val dateKey = currentState.dateKey

        val prayerItem = currentState.prayers.find { it.id == prayerId } ?: return
        val currentCompleted = prayerItem.isCompleted

        viewModelScope.launch {
            // Write to Native SQLite
            WaqtNativeBridge.togglePrayer(dateKey, prayerId, !currentCompleted)
            
            // Refresh the local state from C++
            loadHomeState()
            
            // Update scheduled system alarms
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }
}
