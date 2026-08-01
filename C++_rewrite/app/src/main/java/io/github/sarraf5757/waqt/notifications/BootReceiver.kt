// Reschedules prayer notifications upon device boot

package io.github.sarraf5757.waqt.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {

    /**
     * Reschedules all active prayer notifications upon device system boot
     */
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            NotificationScheduler.scheduleNotifications(context)
        }
    }
}
