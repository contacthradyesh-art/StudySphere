'use client';

import type { FocusSettings } from '@/lib/firestore/pomodoro-schema';

/**
 * Android-side Focus Shield helpers (Accessibility service inside the APK).
 * Everything is feature-detected, so the web app also works with an older APK
 * and in a normal browser (where these calls simply do nothing).
 */

export interface FocusApp {
  id: string;
  label: string;
  labelHi: string;
  packageName: string;
}

/** Distraction apps a student can block on Android. */
export const FOCUS_APPS: FocusApp[] = [
  { id: 'youtube', label: 'YouTube', labelHi: 'यूट्यूब', packageName: 'com.google.android.youtube' },
  { id: 'instagram', label: 'Instagram', labelHi: 'इंस्टाग्राम', packageName: 'com.instagram.android' },
  { id: 'facebook', label: 'Facebook', labelHi: 'फेसबुक', packageName: 'com.facebook.katana' },
  { id: 'snapchat', label: 'Snapchat', labelHi: 'स्नैपचैट', packageName: 'com.snapchat.android' },
  { id: 'x', label: 'X (Twitter)', labelHi: 'एक्स (ट्विटर)', packageName: 'com.twitter.android' },
  { id: 'telegram', label: 'Telegram', labelHi: 'टेलीग्राम', packageName: 'org.telegram.messenger' },
  { id: 'whatsapp', label: 'WhatsApp', labelHi: 'व्हाट्सऐप', packageName: 'com.whatsapp' },
  { id: 'netflix', label: 'Netflix', labelHi: 'नेटफ्लिक्स', packageName: 'com.netflix.mediaclient' },
  { id: 'primevideo', label: 'Prime Video', labelHi: 'प्राइम वीडियो', packageName: 'com.amazon.avod.thirdpartyclient' },
  { id: 'hotstar', label: 'Hotstar', labelHi: 'हॉटस्टार', packageName: 'in.startv.hotstar' },
  { id: 'reddit', label: 'Reddit', labelHi: 'रेडिट', packageName: 'com.reddit.frontpage' },
  { id: 'sharechat', label: 'ShareChat', labelHi: 'शेयरचैट', packageName: 'in.mohalla.sharechat' },
  { id: 'moj', label: 'Moj', labelHi: 'मोज', packageName: 'in.mohalla.video' },
];

/** The existing preset toggles keep working: on Android they block the whole app. */
const PRESET_APP_IDS = {
  blockShorts: 'youtube',
  blockReels: 'instagram',
  blockFacebookReels: 'facebook',
} as const;

interface ShieldBridge {
  isPermissionGranted?: () => boolean;
  openPermissionSettings?: () => void;
  setShieldActive?: (active: boolean) => void;
  getBridgeVersion?: () => number;
  setShieldSession?: (endsAtMillis: number, packagesJson: string, youtubeJson: string) => boolean;
  getYoutubeDebug?: () => string;
}

export function getShieldBridge(): ShieldBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { StudySphereFocusShield?: ShieldBridge }).StudySphereFocusShield;
}

type ShieldSettings = Pick<FocusSettings, 'blockShorts' | 'blockReels' | 'blockFacebookReels' | 'youtubeMode' | 'studyChannels'> & {
  blockedApps?: string[];
};

/** True only when the new 3-argument Android bridge is present. */
export function supportsYoutubeStudyMode(): boolean {
  const bridge = getShieldBridge();
  if (typeof bridge?.setShieldSession !== 'function') return false;
  try {
    const version = typeof bridge.getBridgeVersion === 'function' ? Number(bridge.getBridgeVersion()) : 0;
    return version >= 3 || bridge.setShieldSession.length >= 3;
  } catch {
    return bridge.setShieldSession.length >= 3;
  }
}

/** Android package names to block for these settings (presets + chosen apps). */
export function packagesForSettings(settings: ShieldSettings): string[] {
  const ids = new Set<string>(settings.blockedApps ?? []);
  (Object.keys(PRESET_APP_IDS) as Array<keyof typeof PRESET_APP_IDS>).forEach((key) => {
    if (settings[key]) ids.add(PRESET_APP_IDS[key]);
  });

  // In Study mode YouTube is handled by the Accessibility tree checker, not full-app blocking.
  if (settings.youtubeMode === 'study') ids.delete('youtube');

  return FOCUS_APPS.filter((app) => ids.has(app.id)).map((app) => app.packageName);
}

function youtubeJsonForSettings(settings: ShieldSettings): string {
  const channels = Array.from(
    new Set(
      (settings.studyChannels ?? [])
        .map((channel) => channel.trim().slice(0, 60))
        .filter(Boolean)
    )
  ).slice(0, 30);

  return JSON.stringify({
    mode: settings.youtubeMode === 'study' ? 'study' : 'block',
    channels
  });
}

/** Start (or refresh) the native shield. Returns true when the Android side accepted it. */
export function startNativeShield(endsAt: number, settings: ShieldSettings): boolean {
  const bridge = getShieldBridge();
  if (!bridge) return false;
  try {
    if (settings.youtubeMode === 'study' && supportsYoutubeStudyMode()) {
      return Boolean(
        bridge.setShieldSession?.(
          endsAt,
          JSON.stringify(packagesForSettings(settings)),
          youtubeJsonForSettings(settings)
        )
      );
    }

    if (bridge.setShieldSession) {
      // Legacy APKs expose the old 2-argument method. Extra JS arguments are
      // ignored by old WebView bridges, so Study mode deliberately sends the
      // legacy/full-block package list on that path.
      const legacySettings = settings.youtubeMode === 'study' ? { ...settings, youtubeMode: 'block' as const } : settings;
      return Boolean(
        bridge.setShieldSession(
          endsAt,
          JSON.stringify(packagesForSettings(legacySettings)),
          youtubeJsonForSettings(legacySettings)
        )
      );
    }

    // Older APK: only the legacy on/off switch exists.
    bridge.setShieldActive?.(true);
    return Boolean(bridge.setShieldActive);
  } catch {
    return false;
  }
}

export function stopNativeShield() {
  try {
    getShieldBridge()?.setShieldActive?.(false);
  } catch {
    /* ignore */
  }
}
