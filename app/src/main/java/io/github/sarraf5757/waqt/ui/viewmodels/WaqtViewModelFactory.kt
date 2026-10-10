package io.github.sarraf5757.waqt.ui.viewmodels

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import io.github.sarraf5757.waqt.bridge.IWaqtBridge
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge

class WaqtViewModelFactory(
    private val application: Application,
    private val waqtBridge: IWaqtBridge = WaqtNativeBridge
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HomeViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return HomeViewModel(application, waqtBridge) as T
        }
        if (modelClass.isAssignableFrom(StreakViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return StreakViewModel(application, waqtBridge) as T
        }
        if (modelClass.isAssignableFrom(SettingsViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return SettingsViewModel(application, waqtBridge) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
