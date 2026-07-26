import type { FocusSettings } from '@/lib/firestore/pomodoro-schema';

/**
 * Messaging contract between StudySphere and a future browser extension.
 *
 * The web app broadcasts the active block list when a focus session starts and
 * a STOP when it ends. The extension listens via window.postMessage (same-origin
 * content script bridge) and enforces blocking at the network/DOM level.
 *
 * Preset block patterns map the UI toggles to URL/DOM matchers the extension
 * understands. Keep these stable; the extension depends on them.
 */
export const EXTENSION_CHANNEL = 'studysphere-focus';

export const PRESET_BLOCK_PATTERNS = {
  blockShorts: ['youtube.com/shorts'],
  blockReels: ['instagram.com/reels', 'instagram.com/reel'],
  blockFacebookReels: ['facebook.com/reel', 'fb.watch']
} as const;

export interface FocusStartMessage {
  channel: typeof EXTENSION_CHANNEL;
  type: 'FOCUS_START';
  blockList: string[];
  endsAt: number; // epoch ms
}

export interface FocusStopMessage {
  channel: typeof EXTENSION_CHANNEL;
  type: 'FOCUS_STOP';
}

/** Build the full block list from settings (presets + custom entries). */
export function buildBlockList(settings: Pick<FocusSettings, 'blockShorts' | 'blockReels' | 'blockFacebookReels' | 'customBlockList'>): string[] {
  const list: string[] = [];
  if (settings.blockShorts) list.push(...PRESET_BLOCK_PATTERNS.blockShorts);
  if (settings.blockReels) list.push(...PRESET_BLOCK_PATTERNS.blockReels);
  if (settings.blockFacebookReels) list.push(...PRESET_BLOCK_PATTERNS.blockFacebookReels);
  list.push(...settings.customBlockList.map((s) => s.trim()).filter(Boolean));
  return Array.from(new Set(list));
}

/** Notify the extension (if installed) that a focus session has begun. */
export function broadcastFocusStart(blockList: string[], endsAt: number) {
  if (typeof window === 'undefined') return;
  const msg: FocusStartMessage = { channel: EXTENSION_CHANNEL, type: 'FOCUS_START', blockList, endsAt };
  window.postMessage(msg, window.location.origin);
}

/** Notify the extension that the focus session has ended. */
export function broadcastFocusStop() {
  if (typeof window === 'undefined') return;
  const msg: FocusStopMessage = { channel: EXTENSION_CHANNEL, type: 'FOCUS_STOP' };
  window.postMessage(msg, window.location.origin);
}
