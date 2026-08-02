// Main activity hosting the UI and handling runtime permissions

package io.github.sarraf5757.waqt

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
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.location.LocationHelper
import io.github.sarraf5757.waqt.notifications.NotificationScheduler
import io.github.sarraf5757.waqt.ui.navigation.AppNavigation
import io.github.sarraf5757.waqt.ui.theme.WaqtTheme
import io.github.sarraf5757.waqt.ui.viewmodels.HomeViewModel
import io.github.sarraf5757.waqt.ui.viewmodels.SettingsViewModel
import io.github.sarraf5757.waqt.ui.viewmodels.StreakViewModel

class MainActivity : ComponentActivity() {
    // ViewModels are the "State Owners" for each screen
    private val homeViewModel: HomeViewModel by viewModels()
    private val streakViewModel: StreakViewModel by viewModels()
    private val settingsViewModel: SettingsViewModel by viewModels()

    /**
\     * PERMISSIONS: Handles the asynchronous callback from the OS when the user accepts/denies permissions
     */
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
     * Called when the window is first allocated
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        requestRuntimePermissions()
        LocationHelper.updateDeviceLocation(this)
        NotificationScheduler.scheduleNotifications(this)

        // Main loop - builds the UI tree
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
     * Called everytime the app is brought back to the foreground
     */
    override fun onResume() {
        super.onResume()
        LocationHelper.updateDeviceLocation(this)
        homeViewModel.loadHomeState()
        NotificationScheduler.scheduleNotifications(this)
    }

    /**
     * Checks and requests permissions
     */
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
