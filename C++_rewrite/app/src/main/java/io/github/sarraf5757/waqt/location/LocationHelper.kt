// Manages device location updates and synchronizes coordinates with C++

package io.github.sarraf5757.waqt.location

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager

import androidx.core.content.ContextCompat

import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge

object LocationHelper {

    /**
     * Fetches last known device GPS/Network position and updates C++ core engine
     */
    @SuppressLint("MissingPermission") // checking permissions manually below
    fun updateDeviceLocation(context: Context) {
        // RUNTIME PERMISSIONS
        val hasFine = ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

        if (!hasFine && !hasCoarse) {
            return
        }

        // LocationManager - the system driver interface
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        // FIRST, try to get the cached location
        val gpsLocation = try {
            locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
        } catch (e: Exception) { null }

        val networkLocation = try {
            locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        } catch (e: Exception) { null }

        val bestLocation: Location? = gpsLocation ?: networkLocation

        if (bestLocation != null) {
            WaqtNativeBridge.updateLocation(bestLocation.latitude, bestLocation.longitude)
        } else {
            // IF NO SAVED LOCATION, request a fresh update using the modern API (Android 11+)
            val provider = if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                LocationManager.GPS_PROVIDER
            } else {
                LocationManager.NETWORK_PROVIDER
            }

            try {
                // Request a location estimate from the system drivers (asynchronous)
                locationManager.getCurrentLocation(
                    provider,
                    null, // No cancellation signal needed
                    ContextCompat.getMainExecutor(context) // Run the callback on the Main UI thread
                ) { location ->
                    if (location != null) {
                        // Forward the raw GPS coordinates to the C++ engine
                        WaqtNativeBridge.updateLocation(location.latitude, location.longitude)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
