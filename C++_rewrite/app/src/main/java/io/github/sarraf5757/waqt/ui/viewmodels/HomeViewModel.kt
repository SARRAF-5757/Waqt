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
        val currentHomeState = _homeState.value
        if (currentHomeState == null) {
            return
        }

        val dateKey = currentHomeState.dateKey
        val prayerList = currentHomeState.prayers

        var foundPrayer: NativeModels.UIPrayerItem? = null
        for (p in prayerList) {
            if (p.id == prayerId) {
                foundPrayer = p
                break
            }
        }

        if (foundPrayer == null) {
            return
        }

        val newCompletedStatus = !foundPrayer.isCompleted

        // Calculate if it's on time
        val nowSec = System.currentTimeMillis() / 1000
        var onTimeResult = false
        if (newCompletedStatus) {
            if (nowSec >= foundPrayer.startTime && nowSec <= foundPrayer.endTime) {
                onTimeResult = true
            }
        }

        viewModelScope.launch {
            // Write to Native SQLite
            WaqtNativeBridge.togglePrayer(dateKey, prayerId, newCompletedStatus, onTimeResult)
            
            // Refresh the local state from C++
            val newState = WaqtNativeBridge.getHomeState()
            _homeState.value = newState
            
            // Update scheduled system alarms
            NotificationScheduler.scheduleNotifications(getApplication())
        }
    }

    /**
     * Marks a previously completed prayer as "on-time" (override)
     */
    fun markAsOnTime(prayerId: String) {
        val currentHomeState = _homeState.value
        if (currentHomeState == null) {
            return
        }

        val dateKey = currentHomeState.dateKey

        viewModelScope.launch {
            // Force isOnTime = true in SQLite
            WaqtNativeBridge.togglePrayer(dateKey, prayerId, true, true)
            
            // Refresh UI
            val newState = WaqtNativeBridge.getHomeState()
            _homeState.value = newState
        }
    }
}
