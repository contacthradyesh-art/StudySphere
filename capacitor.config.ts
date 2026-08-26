import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studysphere.app',
  appName: 'StudySphere',
  webDir: 'out',

  // Stable production origin for Play Store builds. Avoid temporary deployment URLs.
  server: {
    url: 'https://study-sphere-contacthradyesh-arts-projects.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
