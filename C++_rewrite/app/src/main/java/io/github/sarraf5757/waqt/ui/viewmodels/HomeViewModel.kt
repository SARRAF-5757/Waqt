/**
 * ViewModel managing state and logic for the home screen
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
        viewModelScope.launch {
            _homeState.value = WaqtNativeBridge.getHomeState()
        }
    }

    /**
     * Sends a UI event (checking a box) down to the C++ database
     */
    fun togglePrayer(prayerId: String) {
        val currentState = _homeState.value ?: return
        val dateKey = currentState.dateKey

        val prayerItem = currentState.prayers.find { it.id == prayerId } ?: return
        val newCompleted = !prayerItem.isCompleted

        // Calculate if it's on time
        val nowSec = System.currentTimeMillis() / 1000
        val isOnTime = if (newCompleted) {
            nowSec in prayerItem.startTime..prayerItem.endTime
        } else {
            false // Reset onTime when unchecking
        }

        viewModelScope.launch {
            // Write to Native SQLite
            WaqtNativeBridge.togglePrayer(dateKey, prayerId, newCompleted, isOnTime)
            
            // Refresh the local state from C++
            _homeState.value = WaqtNativeBridge.getHomeState()
            
            // Update scheduled system alarms
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }

    /**
     * Marks a previously completed prayer as "on-time" (override)
     */
    fun markAsOnTime(prayerId: String) {
        val currentState = _homeState.value ?: return
        val dateKey = currentState.dateKey

        viewModelScope.launch {
            // Force isOnTime = true in SQLite
            WaqtNativeBridge.togglePrayer(dateKey, prayerId, true, true)
            
            // Refresh UI
            _homeState.value = WaqtNativeBridge.getHomeState()
        }
    }
}
