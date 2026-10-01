export {};

declare global {
  interface StudySphereFocusShieldBridge {
    isPermissionGranted?: () => boolean;
    openPermissionSettings?: () => void;
    setShieldActive?: (active: boolean) => void;
  }

  interface Window {
    StudySphereFocusShield?: StudySphereFocusShieldBridge;
  }
}
