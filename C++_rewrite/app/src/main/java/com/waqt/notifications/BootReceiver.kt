/**
 * File Role: BroadcastReceiver that catches ACTION_BOOT_COMPLETED to reschedule prayer notifications when device reboots.
 */
package com.waqt.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {

    /**
     * RME:
     * Reads: Device boot action.
     * Modifies: AlarmManager state.
     * Effects: Reschedules all active prayer notifications upon device system boot.
     */
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            NotificationScheduler.scheduleNotifications(context)
        }
    }
}
