export {};

declare global {
  interface StudySphereFocusShieldBridge {
    isPermissionGranted?: () => boolean;
    openPermissionSettings?: () => void;
    setShieldActive?: (active: boolean) => void;
    /** New Android bridge: timed shield + YouTube study configuration. */
    setShieldSession?: (endsAtMillis: number, packagesJson: string, youtubeJson: string) => boolean;
    /** Legacy Android bridge remains supported by native-shield.ts. */
    getYoutubeDebug?: () => string;
  }

  interface Window {
    StudySphereFocusShield?: StudySphereFocusShieldBridge;
  }
}
