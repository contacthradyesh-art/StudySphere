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
    private static final String KEY_YOUTUBE_MODE = "youtubeMode";
    private static final String KEY_YOUTUBE_CHANNELS = "youtubeChannels";
    private static final String KEY_YOUTUBE_DEBUG = "youtubeDebug";
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

    private static String sanitizeYoutubeJson(String raw) throws Exception {
        JSONObject input = new JSONObject(raw == null ? "{}" : raw);
        String mode = "study".equals(input.optString("mode")) ? "study" : "block";
        JSONArray cleanChannels = new JSONArray();
        JSONArray channels = input.optJSONArray("channels");
        if (channels != null) {
            for (int i = 0; i < channels.length() && cleanChannels.length() < 30; i++) {
                String channel = channels.optString(i, "").trim();
                if (!channel.isEmpty()) cleanChannels.put(channel.substring(0, Math.min(60, channel.length())));
            }
        }
        JSONObject clean = new JSONObject();
        clean.put("mode", mode);
        clean.put("channels", cleanChannels);
        return clean.toString();
    }

    private static final String YOUTUBE_PACKAGE = "com.google.android.youtube";

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

        /** Bridge version 3 adds YouTube study mode while keeping legacy methods. */
        @JavascriptInterface
        public int getBridgeVersion() {
            return 3;
        }

        /** Legacy call (old web builds). Capped so the shield can never stay on forever. */
        @JavascriptInterface
        public void setShieldActive(boolean active) {
            android.content.SharedPreferences.Editor edit = getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("active", active);
            if (active) edit.putLong("endsAt", System.currentTimeMillis() + 2L * 60 * 60 * 1000);
            else edit.putLong("endsAt", 0);
            edit.putString(KEY_YOUTUBE_MODE, "block").putString(KEY_YOUTUBE_CHANNELS, "[]");
            edit.apply();
        }

        /** Legacy timed session API: YouTube is always full-blocked. */
        @JavascriptInterface
        public boolean setShieldSession(long endsAtMillis, String packagesJson) {
            return setShieldSessionInternal(endsAtMillis, packagesJson, "{\"mode\":\"block\",\"channels\":[]}");
        }

        /** New timed session API with YouTube study configuration. Kept under a
         * distinct name because WebView JavascriptInterface does not safely support
         * overloaded methods. */
        @JavascriptInterface
        public boolean setShieldSessionV3(long endsAtMillis, String packagesJson, String youtubeJson) {
            return setShieldSessionInternal(endsAtMillis, packagesJson, youtubeJson);
        }

        /** Single-string study-session bridge. Using one JSON argument avoids any WebView bridge ambiguity around multi-argument methods. */
        @JavascriptInterface
        public boolean setShieldSessionV4(String payloadJson) {
            try {
                JSONObject payload = new JSONObject(payloadJson == null ? "{}" : payloadJson);
                long endsAtMillis = payload.optLong("endsAt", 0);
                JSONArray packages = payload.optJSONArray("packages");
                JSONObject youtube = payload.optJSONObject("youtube");
                return setShieldSessionInternal(
                    endsAtMillis,
                    packages == null ? "[]" : packages.toString(),
                    youtube == null ? "{\\"mode\\":\\"block\\",\\"channels\\":[]}" : youtube.toString()
                );
            } catch (Exception ignored) {
                return false;
            }
        }

        private boolean setShieldSessionInternal(long endsAtMillis, String packagesJson, String youtubeJson) {
            long now = System.currentTimeMillis();
            long maxEnd = now + 6L * 60 * 60 * 1000;
            if (endsAtMillis <= now) {
                getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                    .putBoolean("active", false)
                    .putLong("endsAt", 0)
                    .putString(KEY_YOUTUBE_MODE, "block")
                    .putString(KEY_YOUTUBE_CHANNELS, "[]")
                    .apply();
                return false;
            }

            JSONArray clean = new JSONArray();
            try {
                JSONArray input = new JSONArray(packagesJson == null ? "[]" : packagesJson);
                for (int i = 0; i < input.length() && clean.length() < 40; i++) {
                    String pkg = input.optString(i, "");
                    if (pkg.matches("[A-Za-z0-9_]+(\\.[A-Za-z0-9_]+)+")) clean.put(pkg);
                }
            } catch (Exception ignored) {
                return false;
            }

            final String cleanYoutube;
            try {
                cleanYoutube = sanitizeYoutubeJson(youtubeJson);
            } catch (Exception ignored) {
                return false;
            }

            try {
                JSONObject youtube = new JSONObject(cleanYoutube);
                boolean youtubeStudy = "study".equals(youtube.optString("mode", "block"));
                if (youtubeStudy) {
                    for (int i = clean.length() - 1; i >= 0; i--) {
                        if (YOUTUBE_PACKAGE.equals(clean.optString(i, ""))) clean.remove(i);
                    }
                }
                boolean sessionHasProtection = clean.length() > 0 || youtubeStudy;
                getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                    .putBoolean("active", sessionHasProtection)
                    .putLong("endsAt", Math.min(endsAtMillis, maxEnd))
                    .putString("packages", clean.toString())
                    .putString(KEY_YOUTUBE_MODE, youtube.optString("mode", "block"))
                    .putString(KEY_YOUTUBE_CHANNELS, youtube.optJSONArray("channels").toString())
                    .apply();
                return sessionHasProtection;
            } catch (Exception ignored) {
                return false;
            }
        }

        @JavascriptInterface
        public String getShieldState() {
            android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
            long endsAt = prefs.getLong("endsAt", 0);
            boolean active = prefs.getBoolean("active", false) && endsAt > System.currentTimeMillis();
            return "{\"active\":" + active + ",\"endsAt\":" + endsAt + "}";
        }

        @JavascriptInterface
        public String getYoutubeDebug() {
            String raw = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_YOUTUBE_DEBUG, "[]");
            try {
                return new JSONArray(raw).toString();
            } catch (Exception ignored) {
                return "[]";
            }
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
