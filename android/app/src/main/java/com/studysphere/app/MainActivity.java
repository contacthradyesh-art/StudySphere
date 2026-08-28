package com.studysphere.app;

import android.content.ComponentName;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String PREFS = "focus_shield";

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
    }
}
