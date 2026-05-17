package com.myreminderapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings

class ReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        // Reschedule next alarm immediately — this is the key to persistent notifications.
        // We reschedule BEFORE showing so that even if the service crashes, the chain continues.
        ReminderScheduler.scheduleNext(context)

        // Show floating overlay if the user has granted draw-over-apps permission
        val canDraw = Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
                Settings.canDrawOverlays(context)

        if (canDraw) {
            val serviceIntent = Intent(context, FloatingOverlayService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
