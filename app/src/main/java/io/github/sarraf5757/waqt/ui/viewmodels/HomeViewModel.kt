/**
 * ViewModel managing state and logic for the home screen
 */

package io.github.sarraf5757.waqt.ui.viewmodels

import android.app.Application

import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.notifications.NotificationScheduler

class HomeViewModel(application: Application, private val waqtBridge: io.github.sarraf5757.waqt.bridge.IWaqtBridge) : AndroidViewModel(application) {

    /**
     * When the value of `_homeState` changes, the UI automatically redraws
     */
    private val _homeState = MutableStateFlow<NativeModels.HomeState?>(null)
    val homeState: StateFlow<NativeModels.HomeState?> = _homeState.asStateFlow()

    private val _dayOffset = MutableStateFlow(0)
    val dayOffset: StateFlow<Int> = _dayOffset.asStateFlow()

    val canNavigatePrevious: StateFlow<Boolean> = _dayOffset.map { it > -1 }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val canNavigateNext: StateFlow<Boolean> = _dayOffset.map { it < 0 }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    init {
        loadHomeState()
        // Sync with preference changes from Settings screen
        viewModelScope.launch {
            waqtBridge.preferenceUpdates.collect {
                loadHomeState()
            }
        }
        // Sync with history updates
        viewModelScope.launch {
            waqtBridge.historyUpdates.collect {
                loadHomeState()
            }
        }
    }

    /**
     * Navigates 1 day back to view or edit yesterday's prayer records
     */
    fun previousDay() {
        if (_dayOffset.value > -1) {
            _dayOffset.value -= 1
            loadHomeState()
        }
    }

    /**
     * Navigates forward back to the present day
     */
    fun nextDay() {
        if (_dayOffset.value < 0) {
            _dayOffset.value += 1
            loadHomeState()
        }
    }

    /**
     * Triggers a JNI call to the C++ core to fetch the latest display data
     */
    fun loadHomeState(offset: Int = _dayOffset.value) {
        viewModelScope.launch {
            _homeState.value = waqtBridge.getHomeState(offset)
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
            waqtBridge.togglePrayer(dateKey, prayerId, newCompletedStatus, onTimeResult)
            
            // Refresh the local state from C++
            val newState = waqtBridge.getHomeState(_dayOffset.value)
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
            waqtBridge.togglePrayer(dateKey, prayerId, true, true)
            
            // Refresh UI
            val newState = waqtBridge.getHomeState(_dayOffset.value)
            _homeState.value = newState
        }
    }
}
