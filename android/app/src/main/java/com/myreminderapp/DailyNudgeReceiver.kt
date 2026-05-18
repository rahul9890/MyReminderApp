package com.myreminderapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import java.util.Calendar

class DailyNudgeReceiver : BroadcastReceiver() {

    companion object {
        private const val CHANNEL_ID = "daily_nudge_channel"
        private const val NOTIFICATION_ID = 3001
    }

    override fun onReceive(context: Context, intent: Intent) {
        val prefs = context.getSharedPreferences("overlay_prefs", Context.MODE_PRIVATE)
        val todosJson = prefs.getString("todos", "[]") ?: "[]"

        val isEmpty = try { JSONArray(todosJson).length() == 0 } catch (e: Exception) { true }

        if (!isEmpty) {
            DailyNudgeScheduler.scheduleForStartHour(context)
            return
        }

        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        if (hour < DailyNudgeScheduler.NUDGE_START_HOUR || hour >= DailyNudgeScheduler.NUDGE_END_HOUR) {
            DailyNudgeScheduler.scheduleForStartHour(context)
            return
        }

        showNudgeNotification(context)
        DailyNudgeScheduler.scheduleNextNudge(context)
    }

    private fun showNudgeNotification(context: Context) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_ID,
                    "Daily Task Nudge",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Reminds you to add tasks when your list is empty"
                }
            )
        }

        val openApp = PendingIntent.getActivity(
            context, 0,
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("Plan your day!")
            .setContentText("You have no tasks yet — want to add some agenda for today?")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("You have no tasks yet — want to add some agenda for today?")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(openApp)
            .setAutoCancel(true)
            .build()

        nm.notify(NOTIFICATION_ID, notification)
    }
}
