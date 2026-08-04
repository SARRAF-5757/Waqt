// Application class for initialization

package io.github.sarraf5757.waqt

import android.app.Application

import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.notifications.NotificationScheduler

class WaqtApp : Application() {

    /**
     * Called when the application is starting, before any activity, service, or receiver objects have been created
     */
    override fun onCreate() {
        super.onCreate()
        
        // Initialize C++ engine via the JNI bridge
        WaqtNativeBridge.initialize(this)   // passing the internal file path for the SQLite database
        
        // Create/ensure the notification channel is registered
        NotificationScheduler.createNotificationChannel(this)
    }
}
