package com.studysphere.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final String PREFS = "focus_shield";
    private static final String REMINDERS = "study_reminders";
    private static final int NOTIFICATION_PERMISSION_REQUEST = 7301;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new FocusShieldBridge(), "StudySphereFocusShield");
    }

    private boolean isAccessibilityEnabled() {
        String enabled = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (TextUtils.isEmpty(enabled)) return false;
        ComponentName expected = new ComponentName(this, FocusShieldAccessibilityService.class);
        return enabled.contains(expected.flattenToString()) || enabled.contains(expected.flattenToShortString());
    }

    public static void rescheduleStoredReminders(Context context) {
        String raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(REMINDERS, "[]");
        try {
            JSONArray reminders = new JSONArray(raw);
            long now = System.currentTimeMillis();
            for (int i = 0; i < reminders.length(); i++) {
                JSONObject item = reminders.getJSONObject(i);
                long at = item.optLong("at", 0);
                if (at > now) {
                    scheduleAlarm(context, item.optInt("requestCode", i + 1000), at, item.optString("title"), item.optString("body"));
                }
            }
        } catch (Exception ignored) {
            // Corrupt reminder data must never prevent the app from starting.
        }
    }

    private static void scheduleAlarm(Context context, int requestCode, long at, String title, String body) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null || at <= System.currentTimeMillis()) return;

        Intent intent = new Intent(context, StudyReminderReceiver.class);
        intent.putExtra("requestCode", requestCode);
        intent.putExtra(StudyReminderReceiver.EXTRA_TITLE, title);
        intent.putExtra(StudyReminderReceiver.EXTRA_BODY, body);
        PendingIntent pending = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Inexact alarms are used deliberately: they survive app termination and avoid requiring exact-alarm access.
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending);
    }

    private final class FocusShieldBridge {
        @JavascriptInterface
        public boolean isPermissionGranted() {
            return isAccessibilityEnabled();
        }

        @JavascriptInterface
        public void openPermissionSettings() {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            startActivity(intent);
        }

        @JavascriptInterface
        public void setShieldActive(boolean active) {
            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("active", active).apply();
        }

        @JavascriptInterface
        public boolean notificationsGranted() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true;
            return ContextCompat.checkSelfPermission(MainActivity.this, "android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ActivityCompat.requestPermissions(MainActivity.this, new String[]{"android.permission.POST_NOTIFICATIONS"}, NOTIFICATION_PERMISSION_REQUEST);
            }
        }

        @JavascriptInterface
        public boolean scheduleReminder(long atMillis, String title, String body, int requestCode) {
            if (!notificationsGranted() || atMillis <= System.currentTimeMillis()) return false;
            scheduleAlarm(MainActivity.this, requestCode, atMillis, title, body);

            try {
                String raw = getSharedPreferences(PREFS, MODE_PRIVATE).getString(REMINDERS, "[]");
                JSONArray reminders = new JSONArray(raw);
                JSONObject item = new JSONObject();
                item.put("at", atMillis);
                item.put("title", title);
                item.put("body", body);
                item.put("requestCode", requestCode);
                reminders.put(item);
                getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(REMINDERS, reminders.toString()).apply();
            } catch (Exception ignored) { }
            return true;
        }
    }
}
