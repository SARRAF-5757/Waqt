/**
 * ViewModel managing data for the prayer streak grids
 */

package io.github.sarraf5757.waqt.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class StreakViewModel(application: Application) : AndroidViewModel(application) {

    private val _streakData = MutableStateFlow<NativeModels.StreakGridData?>(null)
    val streakData: StateFlow<NativeModels.StreakGridData?> = _streakData.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadStreakData()
        // Reactively refresh in background whenever history changes
        viewModelScope.launch {
            WaqtNativeBridge.historyUpdates.collect {
                loadStreakData()
            }
        }
    }

    /**
     * Loads 105-day streak grids for all 5 prayers from C++ core database
     */
    fun loadStreakData() {
        viewModelScope.launch {
            // Only show full-screen loading on first load to prevent tab-switching flicker
            if (_streakData.value == null) {
                _isLoading.value = true
            }
            val data = withContext(Dispatchers.IO) {
                WaqtNativeBridge.getStreakData()
            }
            _streakData.value = data
            _isLoading.value = false
        }
    }
}
