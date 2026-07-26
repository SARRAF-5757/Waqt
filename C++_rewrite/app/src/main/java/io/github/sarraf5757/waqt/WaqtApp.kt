/**
 * File Role: Application class handling global initialization of C++ native core engine and notification channels.
 */
package io.github.sarraf5757.waqt

import android.app.Application
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge
import io.github.sarraf5757.waqt.notifications.NotificationScheduler

class WaqtApp : Application() {

    /**
     * RME:
     * Reads: Application context.
     * Modifies: SQLite database initialization and system notification channel registry.
     * Effects: Initializes C++ core engine and registers system notification channel.
     */
    override fun onCreate() {
        super.onCreate()
        WaqtNativeBridge.initialize(this)
        NotificationScheduler.createNotificationChannel(this)
    }
}
