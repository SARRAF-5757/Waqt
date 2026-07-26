/**
 * File Role: Main ComponentActivity initializing location/notification permissions and host for Jetpack Compose UI.
 */
package com.waqt

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.core.content.ContextCompat
import com.waqt.bridge.WaqtNativeBridge
import com.waqt.location.LocationHelper
import com.waqt.notifications.NotificationScheduler
import com.waqt.ui.navigation.AppNavigation
import com.waqt.ui.theme.WaqtTheme
import com.waqt.ui.viewmodels.HomeViewModel
import com.waqt.ui.viewmodels.SettingsViewModel
import com.waqt.ui.viewmodels.StreakViewModel

class MainActivity : ComponentActivity() {

    private val homeViewModel: HomeViewModel by viewModels()
    private val streakViewModel: StreakViewModel by viewModels()
    private val settingsViewModel: SettingsViewModel by viewModels()

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val locationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (locationGranted) {
            LocationHelper.updateDeviceLocation(this)
            homeViewModel.loadHomeState()
            streakViewModel.loadStreakData()
            NotificationScheduler.scheduleNotifications(this)
        }
    }

    /**
     * RME:
     * Reads: SavedInstanceState, permissions state.
     * Modifies: UI window content and location updates.
     * Effects: Enables edge-to-edge drawing, requests runtime permissions, updates location, and launches Compose UI theme wrapper.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        requestRuntimePermissions()
        LocationHelper.updateDeviceLocation(this)
        NotificationScheduler.scheduleNotifications(this)

        setContent {
            val prefsState by settingsViewModel.prefs.collectAsState()
            val themeColor = prefsState?.themeColor ?: "Material You"

            WaqtTheme(themeColor = themeColor) {
                AppNavigation(
                    homeViewModel = homeViewModel,
                    streakViewModel = streakViewModel,
                    settingsViewModel = settingsViewModel
                )
            }
        }
    }

    /**
     * RME:
     * Reads: App lifecycle resume event.
     * Modifies: UI State.
     * Effects: Refreshes location and home state whenever app comes to foreground.
     */
    override fun onResume() {
        super.onResume()
        LocationHelper.updateDeviceLocation(this)
        homeViewModel.loadHomeState()
        NotificationScheduler.scheduleNotifications(this)
    }

    private fun requestRuntimePermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }
}
