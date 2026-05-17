package com.myreminderapp

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.widget.TextView
import org.json.JSONArray

class OverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_overlay)

        val prefs = getSharedPreferences("overlay_prefs", MODE_PRIVATE)
        val todosJson = prefs.getString("todos", "[]") ?: "[]"

        val todoViews = listOf(
            findViewById<TextView>(R.id.todo_1),
            findViewById<TextView>(R.id.todo_2),
            findViewById<TextView>(R.id.todo_3),
        )
        val emptyView = findViewById<TextView>(R.id.no_todos)

        try {
            val todos = JSONArray(todosJson)
            if (todos.length() == 0) {
                emptyView.visibility = View.VISIBLE
            } else {
                val count = minOf(todos.length(), 3)
                for (i in 0 until count) {
                    val todo = todos.getJSONObject(i)
                    todoViews[i].text = "${i + 1}. ${todo.getString("text")}"
                    todoViews[i].visibility = View.VISIBLE
                }
            }
        } catch (e: Exception) {
            emptyView.visibility = View.VISIBLE
        }

        // Close button dismisses the overlay
        findViewById<View>(R.id.btn_close).setOnClickListener { finish() }

        // Tapping the dim background also closes
        findViewById<View>(R.id.overlay_bg).setOnClickListener { finish() }
    }
}
