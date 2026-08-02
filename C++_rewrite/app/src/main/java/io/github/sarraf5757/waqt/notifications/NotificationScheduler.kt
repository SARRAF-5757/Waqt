// Manages notification channels and schedules precise alarms

package io.github.sarraf5757.waqt.notifications

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.content.edit
import android.os.Build
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge

object NotificationScheduler {

    const val CHANNEL_ID = "default"
    private const val PREFS_NAME = "notification_prefs"
    private const val KEY_SCHEDULED_COUNT = "scheduled_count"

    /**
     * Creates system notification channel with default importance and vibration pattern
     */
    fun createNotificationChannel(context: Context) {
        val name = "default"
        val descriptionText = "Waqt Prayer Reminders"
        val importance = NotificationManager.IMPORTANCE_DEFAULT
        val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
            description = descriptionText
            vibrationPattern = longArrayOf(0, 250, 250, 250)
            enableVibration(true)
        }
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    /**
     * Re-schedules notifications for future prayers, cancelling old ones
     */
    fun scheduleNotifications(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val scheduleIntents = WaqtNativeBridge.getNotificationSchedule()
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Cancel previously scheduled notifications efficiently
        val previousCount = prefs.getInt(KEY_SCHEDULED_COUNT, 0)
        for (i in 0 until previousCount) {
            val cancelIntent = Intent(context, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                i,
                cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }

        // Schedule new intents
        val newCount = minOf(scheduleIntents.size, 50)
        for (index in 0 until newCount) {
            val intentItem = scheduleIntents[index]

            val intent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("NOTIFICATION_ID", index)
                putExtra("TITLE", intentItem.title)
                putExtra("BODY", intentItem.body)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                index,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val triggerMillis = intentItem.triggerTimestampSec * 1000L

            try {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
            } catch (e: SecurityException) {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
            }
        }

        // Save the number of scheduled alarms for the next cycle
        prefs.edit(commit = false) {
            putInt(KEY_SCHEDULED_COUNT, newCount)
        }
    }
}
