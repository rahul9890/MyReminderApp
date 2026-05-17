package com.myreminderapp

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

object DailyNudgeScheduler {

    private const val REQUEST_CODE = 2002
    private const val NUDGE_INTERVAL_MS = 2 * 60 * 60 * 1000L
    private const val NUDGE_START_HOUR = 10
    private const val NUDGE_END_HOUR = 19 // 7 PM

    @JvmStatic
    fun scheduleFor10AM(context: Context) {
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, NUDGE_START_HOUR)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        schedule(context, cal.timeInMillis)
    }

    @JvmStatic
    fun scheduleNextNudge(context: Context) {
        val cutoff = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, NUDGE_END_HOUR)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val nextTime = System.currentTimeMillis() + NUDGE_INTERVAL_MS
        if (nextTime < cutoff.timeInMillis) {
            schedule(context, nextTime)
        } else {
            scheduleFor10AM(context)
        }
    }

    @JvmStatic
    fun cancel(context: Context) {
        (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager)
            .cancel(buildPendingIntent(context))
    }

    private fun schedule(context: Context, triggerAt: Long) {
        val pendingIntent = buildPendingIntent(context)
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        try {
            when {
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager.canScheduleExactAlarms() ->
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent)
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ->
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent)
                else ->
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent)
            }
        } catch (e: SecurityException) {
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent)
        }
    }

    private fun buildPendingIntent(context: Context): PendingIntent {
        val intent = Intent(context, DailyNudgeReceiver::class.java)
        return PendingIntent.getBroadcast(
            context, REQUEST_CODE, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
