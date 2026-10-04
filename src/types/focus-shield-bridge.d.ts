export {};

declare global {
  interface StudySphereFocusShieldBridge {
    isPermissionGranted?: () => boolean;
    openPermissionSettings?: () => void;
    setShieldActive?: (active: boolean) => void;
    getBridgeVersion?: () => number;
    /** Legacy Android bridge: timed shield with package list only. */
    setShieldSession?: (endsAtMillis: number, packagesJson: string) => boolean;
    /** Android V3 bridge: timed shield + YouTube study configuration. */
    setShieldSessionV3?: (endsAtMillis: number, packagesJson: string, youtubeJson: string) => boolean;
    getYoutubeDebug?: () => string;
  }

  interface Window {
    StudySphereFocusShield?: StudySphereFocusShieldBridge;
  }
}
