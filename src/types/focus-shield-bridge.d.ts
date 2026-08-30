export {};

declare global {
  interface NativeReminderBridge {
    isPermissionGranted: () => boolean;
    openPermissionSettings: () => void;
    setShieldActive: (active: boolean) => void;
  }

  interface Window {
    StudySphereFocusShield?: NativeReminderBridge;
  }
}
