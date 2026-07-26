/**
 * File Role: Manages Android system notification channels and schedules exact alarm notifications using AlarmManager.
 */
package io.github.sarraf5757.waqt.notifications

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge

object NotificationScheduler {

    const val CHANNEL_ID = "default"

    /**
     * RME:
     * Reads: Android OS version.
     * Modifies: System NotificationManager channels.
     * Effects: Creates system notification channel with default importance and vibration pattern.
     */
    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
    }

    /**
     * RME:
     * Reads: Notification intents computed by C++ WaqtEngine core.
     * Modifies: AlarmManager pending intents.
     * Effects: Cancels past scheduled alarms and schedules exact system alarms for future prayer notifications.
     */
    fun scheduleNotifications(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val scheduleIntents = WaqtNativeBridge.getNotificationSchedule()

        // Cancel previously scheduled notifications
        for (i in 0 until 50) {
            val cancelIntent = Intent(context, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                i,
                cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }

        // Schedule new intents (up to system limit)
        for (index in scheduleIntents.indices) {
            if (index >= 50) break
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

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
                } catch (e: SecurityException) {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
                }
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
            }
        }
    }
}
