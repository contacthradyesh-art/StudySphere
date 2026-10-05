package com.studysphere.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityEvent;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Real Android-side Focus Shield. It watches foreground apps and, in YouTube Study mode,
 * inspects only YouTube's accessibility tree while a StudySphere focus session is active. */
public class FocusShieldAccessibilityService extends AccessibilityService {
    static final String PREFS = "focus_shield";
    static final String KEY_ACTIVE = "active";
    static final String KEY_ENDS_AT = "endsAt";
    static final String KEY_PACKAGES = "packages";
    static final String KEY_YOUTUBE_MODE = "youtubeMode";
    static final String KEY_YOUTUBE_CHANNELS = "youtubeChannels";
    static final String KEY_YOUTUBE_DEBUG = "youtubeDebug";

    private static final String YOUTUBE_PACKAGE = "com.google.android.youtube";
    private static final long YOUTUBE_SCAN_THROTTLE_MS = 500;
    private static final long YOUTUBE_BLOCK_COOLDOWN_MS = 1500;
    private static final long CHANNEL_FAIL_OPEN_MS = 2500;
    private static final int MAX_TREE_DEPTH = 25;
    private static final int MAX_DEBUG_ENTRIES = 20;

    /** Used only when the app never sent a list (older web build). */
    private static final Set<String> DEFAULT_PACKAGES = new HashSet<>(Arrays.asList(
            YOUTUBE_PACKAGE,
            "com.instagram.android",
            "com.facebook.katana"
    ));

    private long lastLaunchAt = 0;
    private long lastYoutubeScanAt = 0;
    private long lastYoutubeBlockAt = 0;
    private long youtubeWatchStartedAt = 0;
    private long lastUnknownDebugAt = 0;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        try {
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

            if (YOUTUBE_PACKAGE.equals(pkg) && isYoutubeStudyMode(prefs)) {
                handleYoutubeStudyEvent(prefs);
                return;
            }

            if (!blockedPackages(prefs).contains(pkg)) return;

            long now = System.currentTimeMillis();
            if (now - lastLaunchAt < 700) return; // avoid launching the overlay repeatedly
            lastLaunchAt = now;

            showBlockedOverlay(pkg, null);
        } catch (Throwable ignored) {
            // Accessibility trees can disappear while an app redraws. Never let that crash the service.
        }
    }

    private void handleYoutubeStudyEvent(SharedPreferences prefs) {
        long now = System.currentTimeMillis();
        if (now - lastYoutubeScanAt < YOUTUBE_SCAN_THROTTLE_MS) return;
        lastYoutubeScanAt = now;

        AccessibilityNodeInfo root = null;
        try {
            root = getRootInActiveWindow();
            if (root == null) {
                logDebug(prefs, "unknown", null, null, "allow");
                return;
            }

            YoutubeScanResult result = new YoutubeScanResult();
            scanTree(root, 0, result);

            // Only use a channel candidate after the full tree confirms that this
            // is a watch/player screen. Home/Subscriptions can contain channel
            // nodes too, but they must never trigger a block.
            if (result.explicitChannelName != null && !result.explicitChannelName.trim().isEmpty()) {
                result.channelName = result.explicitChannelName;
            } else if (result.watchPage && result.channelCandidate != null && !result.channelCandidate.trim().isEmpty()) {
                result.channelName = result.channelCandidate;
            }

            if (result.shortsDetected) {
                youtubeWatchStartedAt = 0;
                if (now - lastYoutubeBlockAt >= YOUTUBE_BLOCK_COOLDOWN_MS) {
                    lastYoutubeBlockAt = now;
                    logDebug(prefs, "shorts", null, null, "back");
                    performGlobalAction(GLOBAL_ACTION_BACK);
                    showBlockedOverlay(YOUTUBE_PACKAGE, "shorts");
                }
                return;
            }

            if (result.channelName != null && !result.channelName.trim().isEmpty()) {
                youtubeWatchStartedAt = now;
                String normalizedChannel = normalizeChannel(result.channelName);
                String matchedId = findMatchedChannel(normalizedChannel, readStudyChannels(prefs));

                if (matchedId != null) {
                    logDebug(prefs, "channel", result.channelName, matchedId, "allow");
                } else if (now - lastYoutubeBlockAt >= YOUTUBE_BLOCK_COOLDOWN_MS) {
                    lastYoutubeBlockAt = now;
                    logDebug(prefs, "channel", result.channelName, null, "block");
                    showBlockedOverlay(YOUTUBE_PACKAGE, "channel");
                }
                return;
            }

            if (result.watchPage) {
                if (youtubeWatchStartedAt == 0) youtubeWatchStartedAt = now;
                if (now - youtubeWatchStartedAt >= CHANNEL_FAIL_OPEN_MS) {
                    if (now - lastUnknownDebugAt >= CHANNEL_FAIL_OPEN_MS) {
                        lastUnknownDebugAt = now;
                        logDebug(prefs, "unknown", null, null, "allow");
                    }
                }
            } else {
                youtubeWatchStartedAt = 0;
            }
        } catch (Throwable ignored) {
            // A transient accessibility error must fail open and never crash the service.
            if (now - lastUnknownDebugAt >= CHANNEL_FAIL_OPEN_MS) {
                lastUnknownDebugAt = now;
                logDebug(prefs, "unknown", null, null, "allow");
            }
        } finally {
            if (root != null) {
                try {
                    root.recycle();
                } catch (Throwable ignored) {
                    // recycle() is best-effort; newer Android versions may no longer pool nodes.
                }
            }
        }
    }

    private void scanTree(AccessibilityNodeInfo node, int depth, YoutubeScanResult result) {
        if (node == null || depth > MAX_TREE_DEPTH || result.shortsDetected) return;

        String viewId = safeString(node.getViewIdResourceName());
        String text = safeString(node.getText());
        String description = safeString(node.getContentDescription());

        String lowerId = viewId.toLowerCase(Locale.ROOT);
        String lowerText = text.toLowerCase(Locale.ROOT).trim();
        String lowerDescription = description.toLowerCase(Locale.ROOT).trim();

        if (lowerId.contains("reel") || lowerId.contains("shorts")) {
            result.shortsDetected = true;
            return;
        }

        if ("shorts".equals(lowerText) && safeSelected(node)) {
            result.shortsDetected = true;
            return;
        }

        // A "channel" resource id can exist on YouTube Home/Subscriptions too.
        // Do not treat every such node as the current video's channel, otherwise
        // Study mode falsely blocks the whole YouTube app. First establish that
        // this is a watch/player screen, then accept only strong channel signals.
        if (lowerId.contains("watch") || lowerId.contains("player") || lowerDescription.contains("video player")) {
            result.watchPage = true;
        }

        if (lowerDescription.contains("go to channel")) {
            String candidate = text.trim();
            if (candidate.isEmpty()) candidate = extractChannelFromDescription(description);
            if (!candidate.isEmpty() && candidate.length() <= 120) {
                result.explicitChannelName = candidate;
            }
        }

        if (isLikelyChannelNode(node, lowerId, text)) {
            String candidate = text.trim();
            if (!candidate.isEmpty() && candidate.length() <= 120) {
                if (result.channelCandidate == null) {
                    result.channelCandidate = candidate;
                }
            }
        }

        try {
            int childCount = Math.min(node.getChildCount(), 120);
            for (int i = 0; i < childCount; i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child == null) continue;
                try {
                    scanTree(child, depth + 1, result);
                } finally {
                    try {
                        child.recycle();
                    } catch (Throwable ignored) {
                        // Best-effort only.
                    }
                }
                if (result.shortsDetected) return;
            }
        } catch (Throwable ignored) {
            // Individual tree branches can become stale while YouTube redraws.
        }
    }

    private boolean isLikelyChannelNode(AccessibilityNodeInfo node, String lowerId, String text) {
        if (text == null || text.trim().isEmpty()) return false;
        if (!lowerId.contains("channel")) return false;

        // Strong IDs are safe even when the node is not clickable. Generic
        // "channel" containers are accepted only when they expose a clickable
        // accessibility target; this avoids matching navigation labels.
        if (lowerId.contains("channel_name")
                || lowerId.contains("channelname")
                || lowerId.contains("channel-title")
                || lowerId.contains("channeltitle")
                || lowerId.contains("channel_title")) {
            return true;
        }

        try {
            return node.isClickable();
        } catch (Throwable ignored) {
            return false;
        }
    }

    private boolean safeSelected(AccessibilityNodeInfo node) {
        try {
            return node.isSelected();
        } catch (Throwable ignored) {
            return false;
        }
    }

    private String extractChannelFromDescription(String description) {
        String lower = description.toLowerCase(Locale.ROOT);
        int index = lower.indexOf("go to channel");
        if (index < 0) return "";
        String candidate = description.substring(index + "go to channel".length());
        candidate = candidate.replaceFirst("^[\\s,:;\\-–—]+", "").trim();
        return candidate.length() <= 120 ? candidate : "";
    }

    private String normalizeChannel(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{Nd}]+", "");
    }

    private String findMatchedChannel(String normalizedChannel, List<String> allowedChannels) {
        if (normalizedChannel.isEmpty()) return null;
        for (String allowed : allowedChannels) {
            String normalizedAllowed = normalizeChannel(allowed);
            if (!normalizedAllowed.isEmpty() && normalizedChannel.contains(normalizedAllowed)) {
                return normalizedAllowed;
            }
        }
        return null;
    }

    private boolean isYoutubeStudyMode(SharedPreferences prefs) {
        return "study".equals(prefs.getString(KEY_YOUTUBE_MODE, "block"));
    }

    private List<String> readStudyChannels(SharedPreferences prefs) {
        List<String> channels = new ArrayList<>();
        String raw = prefs.getString(KEY_YOUTUBE_CHANNELS, "[]");
        try {
            JSONArray array = new JSONArray(raw);
            for (int i = 0; i < array.length() && channels.size() < 30; i++) {
                String channel = array.optString(i, "").trim();
                if (!channel.isEmpty()) channels.add(channel.substring(0, Math.min(60, channel.length())));
            }
        } catch (Exception ignored) {
            // Empty allowlist is safe: no channel can be matched.
        }
        return channels;
    }

    private void logDebug(SharedPreferences prefs, String kind, String channelName, String matchedId, String action) {
        try {
            JSONArray oldEntries = new JSONArray(prefs.getString(KEY_YOUTUBE_DEBUG, "[]"));
            JSONArray next = new JSONArray();
            JSONObject entry = new JSONObject();
            entry.put("time", System.currentTimeMillis());
            entry.put("kind", kind);
            if (channelName != null && !channelName.trim().isEmpty()) entry.put("channelName", channelName.trim());
            if (matchedId != null && !matchedId.isEmpty()) entry.put("matchedId", matchedId);
            entry.put("action", action);

            int start = Math.max(0, oldEntries.length() - (MAX_DEBUG_ENTRIES - 1));
            for (int i = start; i < oldEntries.length(); i++) next.put(oldEntries.get(i));
            next.put(entry);
            prefs.edit().putString(KEY_YOUTUBE_DEBUG, next.toString()).apply();
        } catch (Exception ignored) {
            // Debug logging is never allowed to affect Focus Shield enforcement.
        }
    }

    private void showBlockedOverlay(String pkg, String reason) {
        Intent intent = new Intent(this, FocusBlockedActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("blocked_package", pkg);
        if (reason != null) intent.putExtra("reason", reason);
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

    private static String safeString(CharSequence value) {
        return value == null ? "" : value.toString();
    }

    private static final class YoutubeScanResult {
        boolean shortsDetected;
        boolean watchPage;
        String channelName;
        String explicitChannelName;
        String channelCandidate;
    }

    @Override
    public void onInterrupt() {
        // No-op. The service only observes foreground app changes.
    }
}
