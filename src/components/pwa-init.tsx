'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/notifications/register-sw';

/** Registers the PWA service worker on mount. Renders nothing. */
export function PwaInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
