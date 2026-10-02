import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // New package ID so this APK can install even when an older StudySphere
  // signed with a different key is already installed on the phone.
  appId: 'com.studysphere.mobile',
  appName: 'StudySphere',
  webDir: 'out',

  // Stable production origin for Play Store builds. Avoid temporary deployment URLs.
  server: {
    url: 'https://study-sphere-flax.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
