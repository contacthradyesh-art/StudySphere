package com.studysphere.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;

import org.json.JSONArray;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Real Android-side Focus Shield. While a StudySphere focus session is active it watches the
 * foreground app and intercepts the distraction apps the student selected in the app. */
public class FocusShieldAccessibilityService extends AccessibilityService {
    static final String PREFS = "focus_shield";
    static final String KEY_ACTIVE = "active";
    static final String KEY_ENDS_AT = "endsAt";
    static final String KEY_PACKAGES = "packages";

    /** Used only when the app never sent a list (older web build). */
    private static final Set<String> DEFAULT_PACKAGES = new HashSet<>(Arrays.asList(
            "com.google.android.youtube",
            "com.instagram.android",
            "com.facebook.katana"
    ));

    private long lastLaunchAt = 0;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_ACTIVE, false)) return;

        // A shield must never outlive its session (app killed, crash, phone restart...).
        long endsAt = prefs.getLong(KEY_ENDS_AT, 0);
        if (endsAt <= 0 || System.currentTimeMillis() >= endsAt) {
            prefs.edit().putBoolean(KEY_ACTIVE, false).apply();
            return;
        }

        String pkg = event.getPackageName().toString();
        if (pkg.equals(getPackageName())) return;
        if (!blockedPackages(prefs).contains(pkg)) return;

        long now = System.currentTimeMillis();
        if (now - lastLaunchAt < 700) return; // avoid launching the overlay repeatedly
        lastLaunchAt = now;

        Intent intent = new Intent(this, FocusBlockedActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("blocked_package", pkg);
        startActivity(intent);
    }

    private Set<String> blockedPackages(SharedPreferences prefs) {
        String raw = prefs.getString(KEY_PACKAGES, null);
        if (raw == null) return DEFAULT_PACKAGES;
        try {
            JSONArray array = new JSONArray(raw);
            Set<String> out = new HashSet<>();
            for (int i = 0; i < array.length(); i++) out.add(array.getString(i));
            return out;
        } catch (Exception e) {
            return DEFAULT_PACKAGES;
        }
    }

    @Override
    public void onInterrupt() {
        // No-op. The service only observes foreground app changes.
    }
}
