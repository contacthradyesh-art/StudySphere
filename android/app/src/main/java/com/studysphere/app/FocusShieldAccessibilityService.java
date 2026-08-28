package com.studysphere.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Real Android-side Focus Shield. It watches the foreground app while a
 * StudySphere focus session is active and intercepts configured distraction apps. */
public class FocusShieldAccessibilityService extends AccessibilityService {
    private static final Set<String> BLOCKED_PACKAGES = new HashSet<>(Arrays.asList(
            "com.google.android.youtube",
            "com.instagram.android",
            "com.facebook.katana"
    ));

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        if (!getSharedPreferences("focus_shield", MODE_PRIVATE).getBoolean("active", false)) return;

        String pkg = event.getPackageName().toString();
        if (!BLOCKED_PACKAGES.contains(pkg) || pkg.equals(getPackageName())) return;

        Intent intent = new Intent(this, FocusBlockedActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("blocked_package", pkg);
        startActivity(intent);
    }

    @Override
    public void onInterrupt() {
        // No-op. The service only observes foreground app changes.
    }
}
