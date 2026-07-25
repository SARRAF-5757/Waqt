/**
 * File Role: Manages Android foreground location permissions and updates C++ core with device coordinates.
 */
package com.waqt.location

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import androidx.core.content.ContextCompat
import com.waqt.bridge.WaqtNativeBridge

object LocationHelper {

    /**
     * RME:
     * Reads: Location permissions status and system LocationManager.
     * Modifies: C++ WaqtEngine location state.
     * Effects: Fetches last known device GPS/Network position and updates C++ core engine.
     */
    @SuppressLint("MissingPermission")
    fun updateDeviceLocation(context: Context) {
        val hasFine = ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

        if (!hasFine && !hasCoarse) {
            return
        }

        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

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
            // Register single update listener
            val provider = if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                LocationManager.GPS_PROVIDER
            } else {
                LocationManager.NETWORK_PROVIDER
            }

            try {
                locationManager.requestSingleUpdate(provider, object : LocationListener {
                    override fun onLocationChanged(location: Location) {
                        WaqtNativeBridge.updateLocation(location.latitude, location.longitude)
                    }
                    override fun onProviderEnabled(provider: String) {}
                    override fun onProviderDisabled(provider: String) {}
                }, null)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
