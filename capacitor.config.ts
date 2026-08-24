import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studysphere.app',
  appName: 'StudySphere',
  webDir: 'out',

  server: {
    url: 'https://study-sphere-flax.vercel.app',
    androidScheme: 'https',
  },
};

export default config;