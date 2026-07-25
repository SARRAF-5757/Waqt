/**
 * File Role: ViewModel managing the 105-day prayer streak grid data.
 */
package com.waqt.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.waqt.bridge.NativeModels
import com.waqt.bridge.WaqtNativeBridge
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class StreakViewModel(application: Application) : AndroidViewModel(application) {

    private val _streakData = MutableStateFlow<NativeModels.StreakGridData?>(null)
    val streakData: StateFlow<NativeModels.StreakGridData?> = _streakData.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadStreakData()
    }

    /**
     * RME:
     * Reads: System current timestamp in seconds via JNI bridge.
     * Modifies: `_streakData` and `_isLoading` StateFlows.
     * Effects: Loads 105-day streak grids for all 5 prayers from C++ core database.
     */
    fun loadStreakData() {
        viewModelScope.launch {
            _isLoading.value = true
            val data = WaqtNativeBridge.getStreakData()
            _streakData.value = data
            _isLoading.value = false
        }
    }
}
