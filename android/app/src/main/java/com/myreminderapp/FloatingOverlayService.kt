package com.myreminderapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import org.json.JSONArray

class FloatingOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var layoutParams: WindowManager.LayoutParams? = null

    // Holds the todo ids and texts currently shown (up to 3)
    private val shownIds = mutableListOf<String>()
    private val shownTexts = mutableListOf<String>()

    companion object {
        private const val CHANNEL_ID = "overlay_service_channel"
        private const val NOTIF_ID = 8001
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Required for foreground service on Android 8+
        val notif = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Reminder")
            .setContentText("Check your pending tasks")
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setSilent(true)
            .build()
        startForeground(NOTIF_ID, notif)

        loadTodosFromPrefs()

        if (overlayView == null) {
            showOverlay()
        } else {
            // Already showing — just refresh content
            populateRows()
        }

        return START_NOT_STICKY
    }

    private fun loadTodosFromPrefs() {
        shownIds.clear()
        shownTexts.clear()
        val json = getSharedPreferences("overlay_prefs", MODE_PRIVATE)
            .getString("todos", "[]") ?: "[]"
        try {
            val arr = JSONArray(json)
            val count = minOf(arr.length(), 3)
            for (i in 0 until count) {
                val obj = arr.getJSONObject(i)
                shownIds.add(obj.getString("id"))
                shownTexts.add(obj.getString("text"))
            }
        } catch (_: Exception) {}
    }

    private fun showOverlay() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
        overlayView = inflater.inflate(R.layout.floating_overlay, null)

        @Suppress("DEPRECATION")
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            WindowManager.LayoutParams.TYPE_PHONE

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT,
        ).also { it.gravity = Gravity.CENTER }

        windowManager?.addView(overlayView, layoutParams)
        populateRows()
        setupDrag()

        overlayView?.findViewById<View>(R.id.btn_close)?.setOnClickListener {
            stopSelf()
        }
    }

    private fun populateRows() {
        val rows = listOf(
            Triple(R.id.row_1, R.id.todo_text_1, R.id.tick_1),
            Triple(R.id.row_2, R.id.todo_text_2, R.id.tick_2),
            Triple(R.id.row_3, R.id.todo_text_3, R.id.tick_3),
        )
        val emptyView = overlayView?.findViewById<TextView>(R.id.no_todos)

        rows.forEachIndexed { i, (rowId, textId, tickId) ->
            val row = overlayView?.findViewById<LinearLayout>(rowId)
            val textView = overlayView?.findViewById<TextView>(textId)
            val tickView = overlayView?.findViewById<TextView>(tickId)

            if (i < shownTexts.size) {
                textView?.text = "${i + 1}. ${shownTexts[i]}"
                row?.visibility = View.VISIBLE
                val capturedIndex = i
                tickView?.setOnClickListener { markDone(capturedIndex) }
            } else {
                row?.visibility = View.GONE
                tickView?.setOnClickListener(null)
            }
        }

        emptyView?.visibility = if (shownTexts.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun markDone(displayIndex: Int) {
        if (displayIndex >= shownIds.size) return
        val removedId = shownIds[displayIndex]

        // Remove from SharedPreferences so the main app sees the change on next resume
        val prefs = getSharedPreferences("overlay_prefs", MODE_PRIVATE)
        val json = prefs.getString("todos", "[]") ?: "[]"
        try {
            val arr = JSONArray(json)
            val updated = JSONArray()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                if (obj.getString("id") != removedId) updated.put(obj)
            }
            prefs.edit().putString("todos", updated.toString()).apply()
        } catch (_: Exception) {}

        shownIds.removeAt(displayIndex)
        shownTexts.removeAt(displayIndex)

        if (shownTexts.isEmpty()) {
            stopSelf()
        } else {
            populateRows()
        }
    }

    // Makes the overlay draggable by the user
    private fun setupDrag() {
        var startTouchX = 0f
        var startTouchY = 0f
        overlayView?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startTouchX = event.rawX - (layoutParams?.x ?: 0)
                    startTouchY = event.rawY - (layoutParams?.y ?: 0)
                    false
                }
                MotionEvent.ACTION_MOVE -> {
                    layoutParams?.x = (event.rawX - startTouchX).toInt()
                    layoutParams?.y = (event.rawY - startTouchY).toInt()
                    windowManager?.updateViewLayout(overlayView, layoutParams)
                    true
                }
                else -> false
            }
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "Overlay Service", NotificationManager.IMPORTANCE_LOW
            ).also { it.setSound(null, null) }
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        overlayView?.let { windowManager?.removeView(it) }
        overlayView = null
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
