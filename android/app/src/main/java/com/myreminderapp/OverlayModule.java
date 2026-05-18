package com.myreminderapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class OverlayModule extends ReactContextBaseJavaModule {

    private static final String PREFS_NAME = "overlay_prefs";
    private static final String KEY_TODOS = "todos";
    private static final String KEY_INTERVAL = "interval_ms";

    public OverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "OverlayModule";
    }

    @ReactMethod
    public void saveTodos(String todosJson) {
        prefs().edit().putString(KEY_TODOS, todosJson).apply();
    }

    /** Returns the current todo list JSON from SharedPreferences (may differ from AsyncStorage
     *  if the user ticked items done in the overlay while the app was closed). */
    @ReactMethod
    public void getTodos(Promise promise) {
        promise.resolve(prefs().getString(KEY_TODOS, null));
    }

    @ReactMethod
    public void saveInterval(double intervalMs) {
        prefs().edit().putLong(KEY_INTERVAL, (long) intervalMs).apply();
    }

    @ReactMethod
    public void scheduleAlarm() {
        ReminderScheduler.scheduleNext(getReactApplicationContext());
    }

    @ReactMethod
    public void scheduleDailyNudge() {
        DailyNudgeScheduler.scheduleForStartHour(getReactApplicationContext());
    }

    @ReactMethod
    public void cancelAlarm() {
        ReminderScheduler.cancel(getReactApplicationContext());
    }

    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(getReactApplicationContext()));
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                !Settings.canDrawOverlays(getReactApplicationContext())) {
            Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getReactApplicationContext().getPackageName())
            );
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }

    private SharedPreferences prefs() {
        return getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}
